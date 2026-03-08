// top-level application component defining all routes
// ProtectedRoute is used to guard pages based on auth state
import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Otp from './pages/Otp'
import Success from './pages/Success'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import ThemeToggle from './components/ThemeToggle'
import { useAuth } from './context/AuthContext'

function App() {
  const auth = useAuth()

  return (
    <>
      <ThemeToggle />
      <Routes>
        {/* default redirect to signup */}
        <Route path="/" element={<Navigate to="/signup" replace />} />
        {/* open registration page */}
        <Route path="/signup" element={<Signup />} />
        {/* otp page only if user signed up */}
        <Route
          path="/otp"
          element={
            <ProtectedRoute allowedCondition={auth.isSignedUp} redirectTo="/signup">
              <Otp />
            </ProtectedRoute>
          }
        />
        {/* success confirmation after otp verification */}
        <Route
          path="/success"
          element={
            <ProtectedRoute allowedCondition={auth.isOtpVerified} redirectTo="/signup">
              <Success />
            </ProtectedRoute>
          }
        />
        {/* dashboard only when fully authenticated */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedCondition={auth.isAuthenticated} redirectTo="/signup">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
