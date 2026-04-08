// frontend/src/api/authApi.js
import API from './axios'

export const registerUser = (data) =>
  API.post('/auth/register', data)

export const loginUser = (data) =>
  API.post('/auth/login', data)

export const getCurrentUser = () =>
  API.get('/auth/me')

export const forgotPassword = (email) =>
  API.post('/auth/forgot-password', { email })

export const resetPassword = (token, password) =>
  API.post('/auth/reset-password', { token, password })