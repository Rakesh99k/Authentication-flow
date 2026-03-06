// context provider managing authentication state and persistence
import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isSignedUp, setSignedUp] = useState(false)
  const [isOtpVerified, setOtpVerified] = useState(false)
  const [isAuthenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  // load persisted auth state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        setSignedUp(!!parsed.isSignedUp)
        setOtpVerified(!!parsed.isOtpVerified)
        setAuthenticated(!!parsed.isAuthenticated)
        setUser(parsed.user || null)
      }
    } catch (e) {
      // ignore
    }
  }, [])

  // persist state to localStorage whenever relevant values change
  useEffect(() => {
    const payload = { isSignedUp, isOtpVerified, isAuthenticated, user }
    localStorage.setItem('auth', JSON.stringify(payload))
  }, [isSignedUp, isOtpVerified, isAuthenticated, user])

  // called after successful signup to store user and mark signed-up
  const signup = (userData) => {
    setUser(userData)
    setSignedUp(true)
  }

  // mark OTP as verified
  const verifyOtp = () => setOtpVerified(true)

  // final authentication step before dashboard
  const authenticate = () => setAuthenticated(true)

  // clear all auth state and remove storage
  const logout = () => {
    setSignedUp(false)
    setOtpVerified(false)
    setAuthenticated(false)
    setUser(null)
    localStorage.removeItem('auth')
  }

  return (
    <AuthContext.Provider
      value={{ isSignedUp, isOtpVerified, isAuthenticated, user, signup, verifyOtp, authenticate, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
