// Clean, utilitarian signup page for guests
import Layout from '../components/Layout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import PasswordStrength from '../components/ui/PasswordStrength'
import React, { useState } from 'react'
import { registerGuest } from '../services/api'
import { useToasts } from '../context/ToastContext'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Signup(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const { push } = useToasts()
  const navigate = useNavigate()

  function validateForm(): boolean {
    const errors: Record<string, string> = {}
    
    if (!firstName.trim()) errors.firstName = 'First name is required'
    if (!lastName.trim()) errors.lastName = 'Last name is required'
    
    if (!email) {
      errors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain lowercase letters'
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain uppercase letters'
    } else if (!/[0-9]/.test(password)) {
      errors.password = 'Password must contain numbers'
    } else if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.password = 'Password must contain special characters'
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    
    if (!validateForm()) {
      push({ type: 'error', message: 'Please fix the errors below' })
      return
    }
    
    setLoading(true)
    try{
      const response = await registerGuest({ email, password, firstName, lastName })
      
      // Success - user created in database
      console.log('User registered successfully:', response.user)
      
      // Clear form
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setFirstName('')
      setLastName('')
      setFieldErrors({})
      
      // Show success message and redirect
      push({ type: 'success', message: `Welcome ${firstName}! Your account has been created. Please log in.` })
      
      // Redirect to login page after short delay
      setTimeout(() => {
        navigate('/admin/login', { state: { email } })
      }, 1500)
      
    }catch(err:any){
      console.error('Registration error:', err)
      
      const errorMessage = err?.body?.error || err?.message || 'Signup failed'
      
      // Handle specific error cases
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate') || err?.status === 400) {
        setFieldErrors({ email: 'An account with this email already exists' })
        push({ type: 'error', message: 'Email already registered. Please use a different email or log in.' })
      } else if (errorMessage.includes('Password does not meet requirements')) {
        const passwordErrors = err?.body?.errors || []
        push({ type: 'error', message: 'Password requirements not met: ' + passwordErrors.join(', ') })
      } else if (errorMessage.includes('All fields required')) {
        push({ type: 'error', message: 'All fields are required' })
      } else {
        push({ type: 'error', message: 'Registration failed. Please try again.' })
      }
    }finally{
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 
              className="text-3xl font-bold mb-2" 
              style={{ 
                color: 'var(--primary)', 
                fontFamily: 'Playfair Display, serif' 
              }}
            >
              Create Your Account
            </h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Join Scottish Inn & Suites to manage your bookings
            </p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  value={firstName}
                  onChange={e => {
                    setFirstName(e.target.value)
                    if (fieldErrors.firstName) {
                      setFieldErrors(prev => ({ ...prev, firstName: '' }))
                    }
                  }}
                  error={fieldErrors.firstName}
                  placeholder="John"
                  disabled={loading}
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  value={lastName}
                  onChange={e => {
                    setLastName(e.target.value)
                    if (fieldErrors.lastName) {
                      setFieldErrors(prev => ({ ...prev, lastName: '' }))
                    }
                  }}
                  error={fieldErrors.lastName}
                  placeholder="Doe"
                  disabled={loading}
                  required
                />
              </div>

              {/* Email Field */}
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors(prev => ({ ...prev, email: '' }))
                  }
                }}
                error={fieldErrors.email}
                placeholder="john.doe@example.com"
                disabled={loading}
                required
              />

              {/* Password Field */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value)
                    if (fieldErrors.password) {
                      setFieldErrors(prev => ({ ...prev, password: '' }))
                    }
                  }}
                  error={fieldErrors.password}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-sm"
                  style={{ color: 'var(--muted)' }}
                  tabIndex={-1}
                >
                  {showPassword ? '???' : '???????'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <PasswordStrength password={password} />

              {/* Confirm Password Field */}
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value)
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors(prev => ({ ...prev, confirmPassword: '' }))
                  }
                }}
                error={fieldErrors.confirmPassword}
                placeholder="••••••••"
                disabled={loading}
                required
              />

              {/* Password Requirements */}
              <div 
                className="text-xs p-3 rounded-lg" 
                style={{ 
                  backgroundColor: 'rgba(184, 134, 11, 0.05)', 
                  border: '1px solid var(--border)' 
                }}
              >
                <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
                  Password Requirements:
                </p>
                <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--muted)' }}>
                  <li>At least 8 characters</li>
                  <li>One uppercase & one lowercase letter</li>
                  <li>One number and one special character</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => navigate('/admin/login')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--border)' }}></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white" style={{ color: 'var(--muted)' }}>
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <Link 
                  to="/admin/login" 
                  className="text-sm font-medium hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  Sign in to your account ?
                </Link>
              </div>
            </form>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center text-xs" style={{ color: 'var(--muted)' }}>
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline" style={{ color: 'var(--primary)' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="underline" style={{ color: 'var(--primary)' }}>
              Privacy Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}
