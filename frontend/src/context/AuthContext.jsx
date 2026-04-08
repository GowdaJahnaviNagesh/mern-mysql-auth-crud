// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getCurrentUser } from '../api/authApi'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token,   setToken]   = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  // On mount, verify token is still valid by hitting /auth/me
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setLoading(false); return }
      try {
        const { data } = await getCurrentUser()
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
      } catch {
        // Token invalid — clear everything
        clearAuth()
      } finally {
        setLoading(false)
      }
    }
    verifyToken()
  }, []) // eslint-disable-line

  const login = useCallback((tokenVal, userData) => {
    localStorage.setItem('token', tokenVal)
    localStorage.setItem('user',  JSON.stringify(userData))
    setToken(tokenVal)
    setUser(userData)
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
