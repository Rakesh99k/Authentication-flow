import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { verifyOtpApi } from '../utils/fakeApi'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import '../styles/global.css'

export default function Otp() {
  const inputsRef = useRef([])
  const [values, setValues] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const auth = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    // auto-focus the first box when component mounts
    focusInput(0)
  }, [])

  function focusInput(idx) {
    const el = inputsRef.current[idx]
    if (el) el.focus()
  }

  function handleChange(e, idx) {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) {
      const copy = [...values]
      copy[idx] = ''
      setValues(copy)
      return
    }
    const char = val.slice(-1)
    const copy = [...values]
    copy[idx] = char
    setValues(copy)
    if (idx < 5) focusInput(idx + 1)
  }

  function handlePaste(e) {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').replace(/\D/g, '')
    if (paste.length === 6) {
      const arr = paste.split('')
      setValues(arr)
      // submit automatically
      setTimeout(() => {
        document.getElementById('otp-form')?.requestSubmit()
      }, 50)
    }
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !values[idx] && idx > 0) {
      focusInput(idx - 1)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const code = values.join('')
    if (code.length !== 6) {
      setError('Enter 6 digits')
      return
    }
    setLoading(true)
    try {
      await verifyOtpApi(code)
      auth.verifyOtp()
      navigate('/success', { replace: true })
    } catch (err) {
      setError(err?.message || 'Verification failed')
    } finally {
      setLoading(false)
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

  return (
    <div className="page center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inner"
      >
        <h1>Enter OTP</h1>
        {auth.user?.email && <p>We sent a code to <strong>{auth.user.email}</strong></p>}
      <form id="otp-form" className="card" onSubmit={handleSubmit}>
        <div className="otp-row" onPaste={handlePaste}>
          {values.map((v, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
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
        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? <Spinner size={18} /> : 'Verify OTP'}
        </button>
      </form>
        </motion.div>
      </div>
  )
}
