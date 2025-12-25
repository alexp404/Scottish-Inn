import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()
  const token = localStorage.getItem('admin_token')

  async function logout(){
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      try {
        await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        })
      } catch (err) {
        console.error('Logout error:', err)
      }
    }
    localStorage.removeItem('admin_token')
    localStorage.removeItem('refresh_token')
    navigate('/')
  }

  return (
    <header className="header container" role="banner" aria-label="Header">
      <div className="brand">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          Scottish Inn & Suites
        </Link>
      </div>
      <nav aria-label="Primary">
        {/* Hotel Navigation */}
        <Link to="/" style={{marginRight:8}}>Home</Link>
        <Link to="/rooms" style={{marginRight:8}}>Rooms</Link>
        <Link to="/about" style={{marginRight:8}}>About</Link>
        <Link to="/contact" style={{marginRight:8}}>Contact</Link>
        
        {/* Admin Navigation */}
        {token ? (
          <>
            <span style={{margin: '0 8px', color: 'var(--border)'}}>|</span>
            <Link to="/admin" style={{marginRight:8}}>Admin</Link>
            <Link to="/admin/devices" style={{marginRight:8}}>Devices</Link>
            <Link to="/admin/sessions" style={{marginRight:8}}>Security</Link>
            <button className="button" onClick={logout} aria-label="Logout">Logout</button>
          </>
        ) : (
          <>
            <Link to="/signup" style={{marginRight:8}}>Sign Up</Link>
            <Link to="/admin/login">Admin Login</Link>
          </>
        )}
      </nav>
    </header>
  )
}
