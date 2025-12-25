import React from 'react'

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'secondary'
}

export default function Button({ variant = 'primary', children, className = '', ...rest }: Props) {
  const classes = [
    'button',
    variant === 'ghost' ? 'button-ghost' : '',
    variant === 'secondary' ? 'button-secondary' : '',
    className
  ].filter(Boolean).join(' ')
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
