import React, { useState } from 'react'
import { useToasts } from '../context/ToastContext'
import { Link } from 'react-router-dom'

export default function ForgotPassword(){
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { push } = useToasts()

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    try{
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://scottish-inn.onrender.com') + '/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Request failed')
      
      setSent(true)
      push({ type: 'success', message: 'Password reset instructions sent to your email' })
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Failed to send reset email' })
    }finally{
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="container">
        <h1>Check Your Email</h1>
        <p>If an account exists for {email}, you will receive password reset instructions.</p>
        <Link to="/admin/login">Back to Login</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Forgot Password</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <label>
          Email
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <div style={{ height: 8 }} />
        <button className="button" type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <div style={{ marginTop: 12 }}>
          <Link to="/admin/login">Back to Login</Link>
        </div>
      </form>
    </div>
  )
}
