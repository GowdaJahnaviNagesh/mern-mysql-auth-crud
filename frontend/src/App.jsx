// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute  from './components/ProtectedRoute'
import PublicRoute     from './components/PublicRoute'
import Login           from './components/Login'
import Register        from './components/Register'
import ForgotPassword  from './components/ForgotPassword'
import ResetPassword   from './components/ResetPassword'
import Dashboard       from './components/Dashboard'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public routes – redirect to dashboard if already logged in */}
        <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/"   element={<Navigate to="/dashboard" replace />} />
        <Route path="*"   element={<Navigate to="/login"     replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default App
