import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/global.css'

export default function Success() {
  const navigate = useNavigate()
  const auth = useAuth()

  function goDashboard() {
    auth.authenticate()
    navigate('/dashboard')
  }

  return (
    <div className="page center">
      <h1>Success 🎉</h1>
      <p>OTP verified successfully.</p>
      <button className="btn" onClick={goDashboard}>
        Go to Dashboard
      </button>
    </div>
  )
}
