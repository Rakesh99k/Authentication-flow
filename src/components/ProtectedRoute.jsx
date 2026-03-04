// wrapper component that redirects if condition not met
import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ allowedCondition, redirectTo = '/signup', children }) {
  // render children only when condition passes, otherwise redirect
  if (allowedCondition) return children
  return <Navigate to={redirectTo} replace />
}
