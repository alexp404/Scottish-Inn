import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToasts } from '../context/ToastContext'

export default function AdminLogin(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { push } = useToasts()

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    try{
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://scottish-inn.onrender.com') + '/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Login failed')
      
      localStorage.setItem('admin_token', data.token)
      if (data.refreshToken) localStorage.setItem('refresh_token', data.refreshToken)
      
      push({ type: 'success', message: 'Logged in' })
      navigate('/admin')
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Login failed' })
    }finally{ setLoading(false) }
  }

  return (
    <div className="container">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit} style={{maxWidth:360}}>
        <label>Username<input className="input" value={username} onChange={e=>setUsername(e.target.value)} /></label>
        <div style={{height:8}} />
        <label>Password<input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        <div style={{height:8}} />
        <button className="button" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        <div style={{ marginTop: 12 }}>
          <Link to="/admin/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </div>
  )
}
