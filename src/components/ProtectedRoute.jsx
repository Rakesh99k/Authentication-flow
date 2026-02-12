import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ allowedCondition, redirectTo = '/signup', children }) {
  if (allowedCondition) return children
  return <Navigate to={redirectTo} replace />
}
