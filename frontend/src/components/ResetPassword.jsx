// frontend/src/components/ResetPassword.jsx
import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../api/authApi'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate  = useNavigate()

  const [form,    setForm]    = useState({ password: '', confirmPassword: '' })
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!form.password) { setError('Password is required'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      const { data } = await resetPassword(token, form.password)
      setSuccess(data.message || 'Password reset successfully!')
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md page-enter">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-900/50">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Reset password
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Choose a strong new password</p>
        </div>

        <div className="card shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div className="alert-error flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="alert-success flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success} Redirecting to login…
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="Min 6 characters" className="input-field" autoComplete="new-password" required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
              <input
                type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat new password" className="input-field" autoComplete="new-password" required
              />
            </div>

            <button type="submit" disabled={loading || !!success} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><span className="spinner" /> Resetting…</> : 'Reset Password'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              ← Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
