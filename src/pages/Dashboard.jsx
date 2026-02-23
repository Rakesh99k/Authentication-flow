import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/global.css'

export default function Dashboard() {
  const auth = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    auth.logout()
    navigate('/signup', { replace: true })
  }

  return (
    <div className="page center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1>Dashboard</h1>
        <div className="card">
          <p><strong>Name:</strong> {auth.user?.name || '-'}</p>
          <p><strong>Email:</strong> {auth.user?.email || '-'}</p>
          <button className="btn" onClick={handleLogout}>Logout</button>
        </div>
      </motion.div>
    </div>
  )
}
