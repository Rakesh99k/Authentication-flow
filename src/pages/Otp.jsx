import React, { useRef, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import '../styles/global.css'

export default function Otp() {
  const inputsRef = useRef([])
  const [values, setValues] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [resendCounter, setResendCounter] = useState(0)
  const [now, setNow] = useState(0)
  const auth = useAuth()
  const navigate = useNavigate()
  const otpStatus = auth.getOtpStatus(now)

  const focusInput = React.useCallback((idx) => {
    const el = inputsRef.current[idx]
    if (el) el.focus()
  }, [])

  React.useEffect(() => {
    setNow(Date.now())
    focusInput(0)
  }, [focusInput])

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  React.useEffect(() => {
    if (!resendCounter) return
    const timer = window.setInterval(() => {
      setResendCounter((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCounter])

  function handleChange(e, idx) {
    const val = e.target.value.replace(/\D/g, '')
    const copy = [...values]
    copy[idx] = val ? val.slice(-1) : ''
    setValues(copy)
    if (val && idx < 5) focusInput(idx + 1)
  }

  function handlePaste(e) {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '')
    if (paste.length === 6) {
      setValues(paste.split(''))
      setTimeout(() => document.getElementById('otp-form')?.requestSubmit(), 50)
    }
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !values[idx] && idx > 0) {
      focusInput(idx - 1)
    }
    if (e.key === 'Enter') {
      document.getElementById('otp-form')?.requestSubmit()
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    const code = values.join('')
    if (code.length !== 6) {
      setError('Enter 6 digits')
      return
    }

    setLoading(true)
    const result = await auth.verifyOtp(code)
    setLoading(false)

    if (result.ok) {
      navigate('/success', { replace: true })
      return
    }

    setError(result.message || 'Verification failed')
    setNow(Date.now())
  }

  function handleResend() {
    setError('')
    setInfo('')
    const result = auth.resendOtp()
    if (result.ok) {
      setValues(['', '', '', '', '', ''])
      setInfo(result.message)
      setResendCounter(30)
      setNow(Date.now())
      focusInput(0)
      return
    }
    setError(result.message || 'Unable to resend code')
  }

  const lockSeconds = Math.ceil(otpStatus.lockRemainingMs / 1000)
  const expirySeconds = Math.ceil(otpStatus.expiresInMs / 1000)
  const verifyDisabled = loading || otpStatus.isLocked || otpStatus.isExpired
  const resendDisabled = resendCounter > 0 || otpStatus.isLocked

  return (
    <div className="page center">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inner"
      >
        <h1>Enter OTP</h1>
        {auth.user?.email && (
          <p>
            We sent a code to <strong>{auth.user.email}</strong>
          </p>
        )}

        <form id="otp-form" className="card" onSubmit={handleSubmit}>
          <div className="otp-row" onPaste={handlePaste}>
            {values.map((v, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el
                }}
                className="otp-input"
                value={v}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                maxLength={1}
                inputMode="numeric"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            Attempts left: {otpStatus.attemptsRemaining} | Expires in: {expirySeconds}s
          </div>
          {otpStatus.isLocked && (
            <div className="error" style={{ marginTop: 6 }}>
              Too many attempts. Locked for {lockSeconds}s.
            </div>
          )}
          {otpStatus.isExpired && !otpStatus.isLocked && (
            <div className="error" style={{ marginTop: 6 }}>
              OTP expired. Resend a new code.
            </div>
          )}
          {error && <div className="error">{error}</div>}
          {info && <div style={{ color: 'var(--muted)', marginTop: 6 }}>{info}</div>}

          <button className="btn" type="submit" disabled={verifyDisabled}>
            {loading ? <Spinner size={18} /> : 'Verify OTP'}
          </button>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn"
              style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }}
              onClick={handleResend}
              disabled={resendDisabled}
            >
              {resendCounter > 0 ? `Resend in ${resendCounter}s` : 'Resend code'}
            </button>
          </div>
        </form>
      </Motion.div>
    </div>
  )
}
