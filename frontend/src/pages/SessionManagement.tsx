import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useToasts } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

interface Session {
  id: string
  ip_address: string
  user_agent: string
  created_at: string
  last_activity: string
  expires_at: string
}

export default function SessionManagement(){
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [twoFAStatus, setTwoFAStatus] = useState({ enabled: false, enabledAt: null })
  const { push } = useToasts()
  const navigate = useNavigate()

  async function loadSessions(){
    setLoading(true)
    try{
      const token = localStorage.getItem('admin_token')
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load sessions')
      setSessions(data.sessions)
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Failed to load sessions' })
    }finally{
      setLoading(false)
    }
  }

  async function load2FAStatus(){
    try{
      const token = localStorage.getItem('admin_token')
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/2fa/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setTwoFAStatus(data)
    }catch(err){
      console.error('Failed to load 2FA status:', err)
    }
  }

  async function revokeSession(sessionId: string){
    if (!confirm('Are you sure you want to revoke this session?')) return
    try{
      const token = localStorage.getItem('admin_token')
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + `/api/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to revoke session')
      
      push({ type: 'success', message: 'Session revoked' })
      loadSessions()
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Failed to revoke session' })
    }
  }

  async function revokeAllSessions(){
    if (!confirm('This will log you out of all other devices. Continue?')) return
    try{
      const token = localStorage.getItem('admin_token')
      const refreshToken = localStorage.getItem('refresh_token')
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/sessions/revoke-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentRefreshToken: refreshToken })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to revoke sessions')
      
      push({ type: 'success', message: data.message })
      loadSessions()
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Failed to revoke sessions' })
    }
  }

  useEffect(() => { loadSessions(); load2FAStatus() }, [])

  return (
    <Layout>
      <div className="container">
        <h1>Security & Sessions</h1>

        <Card>
          <h3>Two-Factor Authentication</h3>
          <p>Add an extra layer of security to your account with 2FA.</p>
          <div style={{ marginTop: 12 }}>
            {twoFAStatus.enabled ? (
              <div>
                <div style={{ color: '#10b981' }}>? 2FA Enabled</div>
                <button className="button" style={{ marginTop: 8 }}>Disable 2FA</button>
              </div>
            ) : (
              <button className="button" onClick={() => navigate('/admin/2fa/setup')}>Enable 2FA</button>
            )}
          </div>
        </Card>

        <Card style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>Active Sessions</h3>
            <button className="button" onClick={revokeAllSessions}>Revoke All Other Sessions</button>
          </div>

          {loading ? <LoadingSpinner /> : (
            sessions.length === 0 ? <p>No active sessions</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sessions.map(session => (
                  <div key={session.id} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{session.ip_address}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{session.user_agent}</div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                          Last active: {new Date(session.last_activity).toLocaleString()}
                        </div>
                      </div>
                      <button className="button" onClick={() => revokeSession(session.id)}>Revoke</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </Card>
      </div>
    </Layout>
  )
}
