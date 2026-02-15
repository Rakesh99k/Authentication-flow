import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/global.css'

export default function Dashboard() {
  const auth = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    auth.logout()
    navigate('/signup')
  }

  return (
    <div className="page center">
      <h1>Dashboard</h1>
      <div className="card">
        <p><strong>Name:</strong> {auth.user?.name || '-'}</p>
        <p><strong>Email:</strong> {auth.user?.email || '-'}</p>
        <button className="btn" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}
