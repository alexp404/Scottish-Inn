// Simple profile page for current user to view and update basic info
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import React, { useEffect, useState } from 'react'
import { getMe, updateMe } from '../services/api'
import { useToasts } from '../context/ToastContext'

export default function Profile(){
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { push } = useToasts()

  useEffect(()=>{
    async function load(){
      setLoading(true)
      try{
        const res = await getMe()
        setUser(res.user)
      }catch(err:any){
        push({ type: 'error', message: err?.message || 'Failed to load profile' })
      }finally{
        setLoading(false)
      }
    }
    load()
  },[])

  async function save(){
    setSaving(true)
    try{
      const res = await updateMe({ firstName: user.first_name, lastName: user.last_name, phoneNumber: user.phone_number })
      setUser(res.user)
      push({ type: 'success', message: 'Profile updated' })
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Failed to update profile' })
    }finally{
      setSaving(false)
    }
  }

  return (
    <Layout>
      <section className="section">
        <h1 style={{color:'var(--primary)'}}>My Profile</h1>
        <Card>
          {loading ? (<div className="loading">Loading…</div>) : user ? (
            <div style={{maxWidth:520}}>
              <label>
                <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>Email</div>
                <input className="input" value={user.email} disabled />
              </label>
              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <label style={{ flex:1 }}>
                  <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>First name</div>
                  <input className="input" value={user.first_name} onChange={e=>setUser({...user, first_name: e.target.value})} />
                </label>
                <label style={{ flex:1 }}>
                  <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>Last name</div>
                  <input className="input" value={user.last_name} onChange={e=>setUser({...user, last_name: e.target.value})} />
                </label>
              </div>
              <label style={{ marginTop:8 }}>
                <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>Phone</div>
                <input className="input" value={user.phone_number ?? ''} onChange={e=>setUser({...user, phone_number: e.target.value})} />
              </label>
              <div style={{ marginTop:12 }}>
                <Button variant="secondary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
              </div>
            </div>
          ) : (<div className="muted">No profile loaded</div>)}
        </Card>
      </section>
    </Layout>
  )
}
