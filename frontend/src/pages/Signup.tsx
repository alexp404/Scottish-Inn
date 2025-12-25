// Clean, utilitarian signup page for guests
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import React, { useState } from 'react'
import { registerGuest } from '../services/api'
import { useToasts } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

export default function Signup(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const { push } = useToasts()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setLoading(true)
    try{
      const res = await registerGuest({ email, password, firstName, lastName })
      push({ type: 'success', message: 'Account created. Please log in.' })
      navigate('/admin/login')
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Signup failed' })
    }finally{
      setLoading(false)
    }
  }

  return (
    <Layout>
      <section className="section">
        <h1 style={{color:'var(--primary)'}}>Create Account</h1>
        <Card>
          <form onSubmit={handleSubmit} style={{maxWidth:420}}>
            <label>
              <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>Email</div>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </label>
            <label style={{ marginTop:8 }}>
              <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>Password</div>
              <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </label>
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <label style={{ flex:1 }}>
                <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>First name</div>
                <input className="input" value={firstName} onChange={e=>setFirstName(e.target.value)} required />
              </label>
              <label style={{ flex:1 }}>
                <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>Last name</div>
                <input className="input" value={lastName} onChange={e=>setLastName(e.target.value)} required />
              </label>
            </div>

            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <Button type="submit" variant="secondary" disabled={loading}>{loading ? 'Creating...' : 'Sign up'}</Button>
              <Button type="button" variant="ghost" onClick={()=>navigate('/admin/login')}>Cancel</Button>
            </div>
          </form>
        </Card>
      </section>
    </Layout>
  )
}
