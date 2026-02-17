import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyOtpApi } from '../utils/fakeApi'
import { useAuth } from '../context/AuthContext'
import '../styles/global.css'

export default function Otp() {
  const inputsRef = useRef([])
  const [values, setValues] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const auth = useAuth()
  const navigate = useNavigate()

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
      navigate('/success')
    } catch (err) {
      setError(err?.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page center">
      <h1>Enter OTP</h1>
      <form className="card" onSubmit={handleSubmit}>
        <div className="otp-row">
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
            />
          ))}
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>
      </form>
    </div>
  )
}
