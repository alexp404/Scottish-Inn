import React, { useEffect, useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { getDeviceStatus, powerControl, setVolume, getChannels } from '../../services/api'
import { DeviceStatus } from '../../types'

export default function FireTVControls({ deviceId: propDeviceId }: { deviceId?: string }){
  const defaultId = 'AMZN123ABC456'
  const deviceId = propDeviceId || defaultId
  const [status, setStatus] = useState<DeviceStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [channels, setChannels] = useState<any[]>([])

  async function refresh(){
    setLoading(true)
    try{
      const res = await getDeviceStatus(deviceId)
      setStatus(res.state as DeviceStatus)
    }catch(err){
      console.error(err)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{ refresh() }, [deviceId])

  async function togglePower(){
    if (!status) return
    const action = status.power === 'on' ? 'off' : 'on'
    await powerControl(deviceId, action as 'on'|'off')
    await refresh()
  }

  async function changeVolume(delta: number){
    if (!status) return
    const newLevel = Math.max(0, Math.min(100, status.volume + delta))
    await setVolume(deviceId, newLevel)
    await refresh()
  }

  async function loadChannels(){
    try{
      const res = await getChannels(deviceId)
      setChannels(res.channels || [])
    }catch(err){
      console.error(err)
    }
  }

  return (
    <Card>
      <h3 style={{color:'var(--primary)'}}>Fire TV Controls</h3>
      {loading && <div className="loading">Loading...</div>}
      {status && (
        <div className="summary" style={{marginTop:8}}>
          <div className="row"><span>Power</span><strong>{status.power}</strong></div>
          <div className="row"><span>Volume</span><strong>{status.volume}</strong></div>
          <div className="row"><span>Channel</span><strong>{status.channel} {status.channelName}</strong></div>
        </div>
      )}

      <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
        <Button onClick={togglePower}>Power</Button>
        <Button onClick={()=>changeVolume(5)}>Vol +</Button>
        <Button onClick={()=>changeVolume(-5)}>Vol -</Button>
        <Button variant="ghost" onClick={loadChannels}>Load channels</Button>
      </div>

      {channels.length>0 && (
        <div style={{marginTop:12}}>
          <h4 style={{marginBottom:6}}>Channels</h4>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c:any)=> (
                <tr key={c.channelNumber}>
                  <td>{c.channelNumber}</td>
                  <td>{c.channelName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
