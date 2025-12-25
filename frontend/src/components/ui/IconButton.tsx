import React from 'react'

export default function IconButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} style={{background:'transparent',border:'none',cursor:'pointer'}}>
      {children}
    </button>
  )
}
