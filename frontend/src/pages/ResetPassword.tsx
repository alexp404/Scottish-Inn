import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useToasts } from '../context/ToastContext'
import PasswordStrength from '../components/ui/PasswordStrength'

export default function ResetPassword(){
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { push } = useToasts()

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    if (password !== confirmPassword) {
      push({ type: 'error', message: 'Passwords do not match' })
      return
    }

    setLoading(true)
    try{
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://scottish-inn.onrender.com') + '/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) {
          push({ type: 'error', message: data.errors.join(', ') })
        } else {
          throw new Error(data?.error || 'Reset failed')
        }
        return
      }
      
      push({ type: 'success', message: 'Password reset successfully' })
      setTimeout(() => navigate('/admin/login'), 1000)
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Failed to reset password' })
    }finally{
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="container">
        <h1>Invalid Reset Link</h1>
        <p>This password reset link is invalid or has expired.</p>
        <Link to="/admin/forgot-password">Request a new reset link</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Reset Password</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <label>
          New Password
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </label>
        <PasswordStrength password={password} />
        <div style={{ height: 8 }} />
        <label>
          Confirm Password
          <input className="input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </label>
        <div style={{ height: 8 }} />
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
        <div style={{ marginTop: 12 }}>
          <Link to="/admin/login">Back to Login</Link>
        </div>
      </form>
    </div>
  )
}
