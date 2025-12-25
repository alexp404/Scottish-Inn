import React from 'react'
import { useToasts } from '../../context/ToastContext'

export default function Toasts(){
  const { toasts, remove } = useToasts()
  return (
    <div style={{position:'fixed',right:12,top:12,display:'flex',flexDirection:'column',gap:8,zIndex:9999}}>
      {toasts.map(t => (
        <div key={t.id} style={{background:t.type==='error'?'#fee2e2':'#ecfdf5',padding:12,borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
          <div style={{fontSize:14,fontWeight:600}}>{t.type === 'error' ? 'Error' : t.type === 'success' ? 'Success' : 'Info'}</div>
          <div style={{marginTop:6}}>{t.message}</div>
          <div style={{marginTop:6,textAlign:'right'}}><button onClick={()=>remove(t.id)} style={{border:'none',background:'transparent',cursor:'pointer'}}>Dismiss</button></div>
        </div>
      ))}
    </div>
  )
}
