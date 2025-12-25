import React from 'react'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string | null
}

export default function Input({ label, error = null, id, ...rest }: Props) {
  const inputId = id || `input_${Math.random().toString(36).slice(2, 9)}`
  return (
    <div style={{ display: 'block', width: '100%', marginBottom: 8 }}>
      {label && (
        <label htmlFor={inputId} style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#374151' }}>
          {label}
        </label>
      )}
      <input id={inputId} className="input" aria-invalid={!!error} {...rest} />
      {error && (
        <div role="alert" style={{ marginTop: 6, color: 'red', fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  )
}
