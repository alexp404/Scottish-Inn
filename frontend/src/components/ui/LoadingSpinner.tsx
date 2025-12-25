import React from 'react'

export default function LoadingSpinner(){
  return (
    <div className="loading">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#c7d2fe" strokeWidth="4"/>
        <path d="M22 12a10 10 0 00-10-10" stroke="#6366f1" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    </div>
  )
}
