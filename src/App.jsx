import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Otp from './pages/Otp'
import Success from './pages/Success'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function App() {
  const auth = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/otp"
        element={
          <ProtectedRoute allowedCondition={auth.isSignedUp} redirectTo="/signup">
            <Otp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/success"
        element={
          <ProtectedRoute allowedCondition={auth.isOtpVerified} redirectTo="/signup">
            <Success />
          </ProtectedRoute>
        }
      />
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
  )
}

export default App
