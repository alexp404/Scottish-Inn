import React from 'react'

interface Props {
  password: string
}

export default function PasswordStrength({ password }: Props){
  function calculateStrength(): { strength: 'weak' | 'medium' | 'strong', score: number, feedback: string[] } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score++
    else feedback.push('At least 8 characters')

    if (/[a-z]/.test(password)) score++
    else feedback.push('One lowercase letter')

    if (/[A-Z]/.test(password)) score++
    else feedback.push('One uppercase letter')

    if (/[0-9]/.test(password)) score++
    else feedback.push('One number')

    if (/[^a-zA-Z0-9]/.test(password)) score++
    else feedback.push('One special character')

    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    if (score >= 5 && password.length >= 12) strength = 'strong'
    else if (score >= 4 && password.length >= 10) strength = 'medium'

    return { strength, score, feedback }
  }

  if (!password) return null

  const { strength, score, feedback } = calculateStrength()
  const colors = { weak: '#ef4444', medium: '#f59e0b', strong: '#10b981' }
  const widths = { weak: '33%', medium: '66%', strong: '100%' }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, height: 4, background: '#e5e7eb', borderRadius: 2 }}>
        <div style={{ width: widths[strength], background: colors[strength], borderRadius: 2, transition: 'all 0.3s' }} />
      </div>
      <div style={{ fontSize: 12, marginTop: 4, color: colors[strength] }}>
        Strength: {strength.charAt(0).toUpperCase() + strength.slice(1)}
      </div>
      {feedback.length > 0 && (
        <div style={{ fontSize: 12, marginTop: 4, color: '#6b7280' }}>
          Required: {feedback.join(', ')}
        </div>
      )}
    </div>
  )
}
