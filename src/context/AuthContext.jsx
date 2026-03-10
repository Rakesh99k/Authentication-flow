/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { verifyOtpApi } from '../utils/fakeApi'

const STORAGE_KEY = 'auth'
const OTP_EXPIRY_MS = 2 * 60 * 1000
const OTP_MAX_ATTEMPTS = 3
const OTP_LOCKOUT_MS = 60 * 1000

const AuthContext = createContext()

const INITIAL_STATE = {
  phase: 'signed_out',
  user: null,
  otp: null,
}

function createOtpState(now) {
  return {
    issuedAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    attemptsRemaining: OTP_MAX_ATTEMPTS,
    lockedUntil: null,
  }
}

function normalizeOtpWindow(otp, now) {
  if (!otp) return otp
  if (otp.lockedUntil && now >= otp.lockedUntil) {
    return { ...otp, lockedUntil: null, attemptsRemaining: OTP_MAX_ATTEMPTS }
  }
  return otp
}

function deriveLegacyPhase(parsed) {
  if (parsed?.isAuthenticated) return 'authenticated'
  if (parsed?.isOtpVerified) return 'otp_verified'
  if (parsed?.isSignedUp) return 'otp_pending'
  return 'signed_out'
}

function sanitizeStoredState(parsed) {
  const now = Date.now()
  const allowedPhases = new Set(['signed_out', 'otp_pending', 'otp_verified', 'authenticated'])
  const phase = allowedPhases.has(parsed?.phase) ? parsed.phase : deriveLegacyPhase(parsed)
  const user = parsed?.user || null

  if (phase !== 'otp_pending') {
    return { phase, user, otp: null }
  }

  const otp = parsed?.otp
  if (!otp || typeof otp !== 'object') {
    return { phase, user, otp: createOtpState(now) }
  }

  return {
    phase,
    user,
    otp: {
      issuedAt: Number.isFinite(otp.issuedAt) ? otp.issuedAt : now,
      expiresAt: Number.isFinite(otp.expiresAt) ? otp.expiresAt : now + OTP_EXPIRY_MS,
      attemptsRemaining:
        Number.isInteger(otp.attemptsRemaining) && otp.attemptsRemaining >= 0
          ? otp.attemptsRemaining
          : OTP_MAX_ATTEMPTS,
      lockedUntil: Number.isFinite(otp.lockedUntil) ? otp.lockedUntil : null,
    },
  }
}

function getInitialAuthState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    return sanitizeStoredState(JSON.parse(raw))
  } catch {
    return INITIAL_STATE
  }
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SIGNUP_SUCCESS': {
      return {
        phase: 'otp_pending',
        user: action.payload.user,
        otp: createOtpState(action.payload.now),
      }
    }
    case 'OTP_UNLOCK': {
      if (state.phase !== 'otp_pending' || !state.otp) return state
      return {
        ...state,
        otp: { ...state.otp, lockedUntil: null, attemptsRemaining: OTP_MAX_ATTEMPTS },
      }
    }
    case 'OTP_RESEND': {
      if (state.phase !== 'otp_pending' || !state.user) return state
      return {
        ...state,
        otp: createOtpState(action.payload.now),
      }
    }
    case 'OTP_VERIFY_FAILURE': {
      if (state.phase !== 'otp_pending' || !state.otp) return state
      const remaining = Math.max(0, state.otp.attemptsRemaining - 1)
      if (remaining === 0) {
        return {
          ...state,
          otp: {
            ...state.otp,
            attemptsRemaining: 0,
            lockedUntil: action.payload.now + OTP_LOCKOUT_MS,
          },
        }
      }
      return {
        ...state,
        otp: { ...state.otp, attemptsRemaining: remaining },
      }
    }
    case 'OTP_VERIFY_SUCCESS': {
      if (state.phase !== 'otp_pending') return state
      return {
        phase: 'otp_verified',
        user: state.user,
        otp: null,
      }
    }
    case 'AUTHENTICATE': {
      if (state.phase !== 'otp_verified') return state
      return { ...state, phase: 'authenticated' }
    }
    case 'LOGOUT':
      return INITIAL_STATE
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialAuthState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const signup = useCallback((userData) => {
    dispatch({ type: 'SIGNUP_SUCCESS', payload: { user: userData, now: Date.now() } })
  }, [])

  const getOtpStatus = useCallback(
    (now = Date.now()) => {
      if (state.phase !== 'otp_pending' || !state.otp) {
        return {
          isLocked: false,
          isExpired: true,
          attemptsRemaining: 0,
          lockRemainingMs: 0,
          expiresInMs: 0,
        }
      }

      const otp = normalizeOtpWindow(state.otp, now)
      const lockRemainingMs = otp.lockedUntil ? Math.max(0, otp.lockedUntil - now) : 0
      const expiresInMs = Math.max(0, otp.expiresAt - now)

      return {
        isLocked: lockRemainingMs > 0,
        isExpired: expiresInMs <= 0,
        attemptsRemaining: otp.attemptsRemaining,
        lockRemainingMs,
        expiresInMs,
      }
    },
    [state],
  )

  const resendOtp = useCallback(() => {
    const now = Date.now()
    if (state.phase !== 'otp_pending' || !state.otp) {
      return { ok: false, message: 'Please sign up again.' }
    }

    const normalized = normalizeOtpWindow(state.otp, now)
    if (normalized.lockedUntil && now < normalized.lockedUntil) {
      return {
        ok: false,
        message: `Too many attempts. Try again in ${Math.ceil((normalized.lockedUntil - now) / 1000)}s.`,
      }
    }

    if (normalized.lockedUntil && now >= normalized.lockedUntil) {
      dispatch({ type: 'OTP_UNLOCK' })
    }

    dispatch({ type: 'OTP_RESEND', payload: { now } })
    return { ok: true, message: 'A new code has been sent. Check your inbox.' }
  }, [state])

  const verifyOtp = useCallback(
    async (code) => {
      const now = Date.now()
      if (state.phase !== 'otp_pending' || !state.otp) {
        return { ok: false, message: 'Please sign up again.' }
      }

      let otp = normalizeOtpWindow(state.otp, now)
      if (otp.lockedUntil && now >= otp.lockedUntil) {
        dispatch({ type: 'OTP_UNLOCK' })
        otp = { ...otp, lockedUntil: null, attemptsRemaining: OTP_MAX_ATTEMPTS }
      }

      if (otp.lockedUntil && now < otp.lockedUntil) {
        return {
          ok: false,
          message: `Too many attempts. Try again in ${Math.ceil((otp.lockedUntil - now) / 1000)}s.`,
        }
      }

      if (now >= otp.expiresAt) {
        return { ok: false, message: 'OTP expired. Please request a new code.' }
      }

      try {
        await verifyOtpApi(code)
        dispatch({ type: 'OTP_VERIFY_SUCCESS' })
        return { ok: true }
      } catch (err) {
        const message = err?.message || 'Verification failed'
        if (message === 'Network error') {
          return { ok: false, message: 'Network error. Please try again.' }
        }

        dispatch({ type: 'OTP_VERIFY_FAILURE', payload: { now } })
        const attemptsAfter = Math.max(0, otp.attemptsRemaining - 1)
        if (attemptsAfter === 0) {
          return {
            ok: false,
            message: `Too many attempts. Locked for ${Math.ceil(OTP_LOCKOUT_MS / 1000)}s.`,
          }
        }
        return {
          ok: false,
          message: `Invalid OTP. ${attemptsAfter} attempt${attemptsAfter === 1 ? '' : 's'} left.`,
        }
      }
    },
    [state],
  )

  const authenticate = useCallback(() => {
    dispatch({ type: 'AUTHENTICATE' })
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' })
  }, [])

  const value = useMemo(
    () => ({
      phase: state.phase,
      user: state.user,
      isSignedUp: state.phase === 'otp_pending',
      isOtpVerified: state.phase === 'otp_verified',
      isAuthenticated: state.phase === 'authenticated',
      signup,
      verifyOtp,
      resendOtp,
      getOtpStatus,
      authenticate,
      logout,
      otpPolicy: {
        expiryMs: OTP_EXPIRY_MS,
        maxAttempts: OTP_MAX_ATTEMPTS,
        lockoutMs: OTP_LOCKOUT_MS,
      },
    }),
    [state, signup, verifyOtp, resendOtp, getOtpStatus, authenticate, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
