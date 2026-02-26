import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  }, [auth, navigate])

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    await performSignup()
  }

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

  return (
    <div className="page center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inner"
      >
        <h1>Sign Up</h1>
        <form className="card form" onSubmit={handleSubmit} noValidate>
        <label>
          Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {errors.name && <div className="error">{errors.name}</div>}
        </label>
        <label>
          Email
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <div className="error">{errors.email}</div>}
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {errors.password && <div className="error">{errors.password}</div>}
        </label>

        {serverError && <div className="error">{serverError}</div>}
        <button className="btn" type="submit" disabled={loading}>
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
      </motion.div>
    </div>
  )
}
