import React from 'react'

interface Props {
  title?: string
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ title, onClose, children }: Props){
  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.4)'}}>
      <div style={{background:'white',padding:16,borderRadius:8,minWidth:320,maxWidth:'90%'}} role="dialog" aria-modal="true">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{fontWeight:700}}>{title}</div>
          <button onClick={onClose} aria-label="Close">×</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
