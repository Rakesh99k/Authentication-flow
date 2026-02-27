import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/global.css'

export default function Success() {
  const navigate = useNavigate()
  const auth = useAuth()

  function goDashboard() {
    auth.authenticate()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="page center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h1>Success 🎉</h1>
        <p>OTP verified successfully.</p>
        <button className="btn" onClick={goDashboard}>
          Go to Dashboard
        </button>
      </motion.div>
    </div>
  )
}
