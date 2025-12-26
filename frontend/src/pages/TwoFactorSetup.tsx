import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'
import { useToasts } from '../context/ToastContext'
import Card from '../components/ui/Card'

export default function TwoFactorSetup(){
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'setup' | 'verify'>('setup')
  const navigate = useNavigate()
  const { push } = useToasts()

  async function setup2FA(){
    setLoading(true)
    try{
      const token = localStorage.getItem('admin_token')
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://scottish-inn.onrender.com') + '/api/2fa/setup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Setup failed')

      setQrCode(data.qrCode)
      setSecret(data.secret)
      setBackupCodes(data.backupCodes)
      setStep('verify')
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Failed to setup 2FA' })
    }finally{
      setLoading(false)
    }
  }

  async function verify2FA(){
    setLoading(true)
    try{
      const token = localStorage.getItem('admin_token')
      const res = await fetch((import.meta.env.VITE_API_URL || 'https://scottish-inn.onrender.com') + '/api/2fa/verify', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Verification failed')

      push({ type: 'success', message: '2FA enabled successfully' })
      navigate('/admin/sessions')
    }catch(err:any){
      push({ type: 'error', message: err?.message || 'Failed to verify 2FA' })
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => { setup2FA() }, [])

  return (
    <Layout>
      <div className="container">
        <h1>Two-Factor Authentication Setup</h1>
        
        {step === 'verify' && (
          <>
            <Card>
              <h3>Step 1: Scan QR Code</h3>
              <p>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
              {qrCode && <img src={qrCode} alt="QR Code" style={{ maxWidth: 300 }} />}
              <p style={{ fontSize: 12, marginTop: 12 }}>Or enter this secret manually: <code>{secret}</code></p>
            </Card>

            <Card style={{ marginTop: 16 }}>
              <h3>Step 2: Backup Codes</h3>
              <p>Save these backup codes in a safe place. You can use them to access your account if you lose your device.</p>
              <div style={{ background: '#f3f4f6', padding: 12, borderRadius: 6, fontFamily: 'monospace', fontSize: 14 }}>
                {backupCodes.map((code, i) => <div key={i}>{code}</div>)}
              </div>
            </Card>

            <Card style={{ marginTop: 16 }}>
              <h3>Step 3: Verify</h3>
              <p>Enter the 6-digit code from your authenticator app to verify setup.</p>
              <input 
                className="input" 
                placeholder="Enter 6-digit code" 
                value={verificationCode} 
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
              <div style={{ marginTop: 12 }}>
                <button className="button" onClick={verify2FA} disabled={loading || verificationCode.length !== 6}>
                  {loading ? 'Verifying...' : 'Enable 2FA'}
                </button>
              </div>
            </Card>
          </>
        )}
      </div>
    </Layout>
  )
}
