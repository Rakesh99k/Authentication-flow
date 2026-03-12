// signup page allows a new user to register
// includes client-side validation, password strength, and UX enhancements
import React, { useState, useEffect } from 'react'
import { motion as Motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { signupApi } from '../utils/fakeApi'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import '../styles/global.css'

export default function Signup() {
  const navigate = useNavigate()
  const auth = useAuth()

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard', { replace: true })
    } else if (auth.isOtpVerified) {
      navigate('/success', { replace: true })
    } else if (auth.isSignedUp) {
      navigate('/otp', { replace: true })
    }
  }, [auth.isAuthenticated, auth.isOtpVerified, auth.isSignedUp, navigate])

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const nameRef = React.useRef()

  React.useEffect(() => {
    nameRef.current?.focus()
  }, [])

  // perform client-side validation and collect errors
  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    // return true if there are no errors
    return Object.keys(e).length === 0
  }

  // form submit handler: validate then attempt signup
  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    await performSignup()
  }

  // calls fake API and updates context on success
  async function performSignup() {
    setLoading(true)
    setServerError('')
    try {
      const res = await signupApi(form)
      auth.signup(res.user)
      navigate('/otp', { replace: true })
    } catch (err) {
      setServerError(err?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  function passwordStrength(pw) {
    if (pw.length > 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)) return 'strong'
    if (pw.length >= 6) return 'medium'
    return 'weak'
  }

  return (
    <div className="page center">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inner"
      >
        <h1>Sign Up</h1>
        <form className="card form" onSubmit={handleSubmit} noValidate>
        <label>
          Name
          <input
            ref={nameRef}
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value })
              if (errors.name) setErrors({ ...errors, name: undefined })
            }}
          />
          {errors.name && <div className="error">{errors.name}</div>}
        </label>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value })
              if (errors.email) setErrors({ ...errors, email: undefined })
            }}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </label>
        <label style={{position:'relative'}}>
          Password <small style={{fontSize:'12px', color:'#555'}}>(min 6 characters)</small>
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            className="password-toggle"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
          {errors.password && <div className="error">{errors.password}</div>}
          {form.password && (
            <div
              className={
                'strength-meter ' + passwordStrength(form.password)
              }
            >
              Password strength: {passwordStrength(form.password)}
            </div>
          )}
        </label>

        {serverError && <div className="error">{serverError}</div>}
        <button
          className="btn"
          type="submit"
          disabled={
            loading ||
            !form.name.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ||
            form.password.length < 6
          }
        >
          {loading ? <Spinner size={18} /> : 'Sign Up'}
        </button>
        {serverError === 'Network error' && (
          <button
            type="button"
            className="btn"
            style={{ marginLeft: 8, background: '#6c757d' }}
            onClick={performSignup}
            disabled={loading}
          >
            Retry
          </button>
        )}
        </form>
      </Motion.div>
    </div>
  )
}

