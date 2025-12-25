import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import React, { useEffect, useState } from 'react'
import { listDevices, createDevice, updateDevice, deleteDevice } from '../services/api'
import FireTVControls from '../components/domain/FireTVControls'

export default function AdminDevices(){
  const [devices, setDevices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load(){
    setLoading(true)
    setError(null)
    try{
      const res = await listDevices()
      setDevices(res.devices)
    }catch(err:any){
      setError(err?.message || 'Failed to load devices')
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ load() },[])

  return (
    <Layout>
      <section className="section">
        <h1 style={{color:'var(--primary)'}}>Fire TV Devices</h1>
        {error && <div style={{color:'red'}}>{error}</div>}
        {loading ? (<div className="loading">Loading…</div>) : (
          <div className="grid">
            {devices.map(d => (
              <Card key={d.id}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:800}}>{d.device_name || d.model_name || d.firetv_device_id}</div>
                    <div className="muted" style={{fontSize:12}}>Room {d.room_number}</div>
                    <div style={{marginTop:6}}><span className={`chip ${d.status==='online'?'online':'offline'}`}>{d.status}</span></div>
                  </div>
                  <div>
                    <Button variant="ghost" onClick={()=>load()}>Refresh</Button>
                  </div>
                </div>
                <div style={{marginTop:12}}>
                  <FireTVControls deviceId={d.firetv_device_id} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}
