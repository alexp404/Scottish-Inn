import React, { useState } from 'react'
import { Room } from '../../types'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { createBooking } from '../../services/api'
import { useToasts } from '../../context/ToastContext'

interface Props {
  room: Room
  onClose?: () => void
  onBooked?: (booking: any) => void
}

const DAY_MS = 24 * 60 * 60 * 1000
const formatDate = (date: Date) => date.toISOString().split('T')[0]

export default function BookingForm({ room, onClose, onBooked }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})
  const [success, setSuccess] = useState<string | null>(null)
  const { push } = useToasts()

  const today = formatDate(new Date())
  const minCheckout = checkIn
    ? formatDate(new Date(new Date(checkIn).getTime() + DAY_MS))
    : formatDate(new Date(Date.now() + DAY_MS))

  function calcNights(): number {
    if (!checkIn || !checkOut) return 0
    const a = new Date(checkIn)
    const b = new Date(checkOut)
    const diff = Math.ceil((b.getTime() - a.getTime()) / DAY_MS)
    return diff > 0 ? diff : 0
  }

  const nights = calcNights()
  const subtotal = nights * room.basePrice

  function validate(){
    const errs: Record<string,string> = {}
    const todayDate = new Date(); todayDate.setHours(0,0,0,0)

    if (!firstName.trim()) errs.firstName = 'First name is required'
    if (!lastName.trim()) errs.lastName = 'Last name is required'
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Valid email is required'

    if (!checkIn) {
      errs.checkIn = 'Check-in date required'
    } else {
      const inDate = new Date(checkIn)
      if (isNaN(inDate.getTime())) errs.checkIn = 'Invalid check-in date'
      else if (inDate < todayDate) errs.checkIn = 'Check-in cannot be in the past'
    }

    if (!checkOut) {
      errs.checkOut = 'Check-out date required'
    } else if (checkIn) {
      const inDate = new Date(checkIn)
      const outDate = new Date(checkOut)
      if (isNaN(outDate.getTime())) errs.checkOut = 'Invalid check-out date'
      else if (outDate <= inDate) errs.checkOut = 'Check-out must be after check-in'
    }

    if (guestCount < 1) errs.guestCount = 'At least 1 guest required'
    if (guestCount > room.capacity) errs.guestCount = `Maximum ${room.capacity} guests for this room`

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!validate()) return

    const payload = {
      room_id: room.id,
      first_name: firstName,
      last_name: lastName,
      email,
      check_in_date: checkIn,
      check_out_date: checkOut,
      guest_count: guestCount,
      subtotal,
    }

    setLoading(true)
    try {
      const res = await createBooking(payload)
      setSuccess('Booking created successfully. Confirmation email sent if address is valid.')
      push({ type: 'success', message: 'Booking created. Confirmation email sent.' })
      onBooked?.(res)
      setTimeout(() => {
        onClose?.()
      }, 800)
    } catch (err: any) {
      // handle server validation errors
      if (err?.status === 400 && err.body?.errors){
        const fe: Record<string,string> = {}
        for (const [k,v] of Object.entries(err.body.errors)){
          if (k === 'first_name') fe.firstName = v as string
          else if (k === 'last_name') fe.lastName = v as string
          else if (k === 'check_in_date') fe.checkIn = v as string
          else if (k === 'check_out_date') fe.checkOut = v as string
          else if (k === 'guest_count') fe.guestCount = v as string
          else if (k === 'email') fe.email = v as string
          else fe[k] = v as string
        }
        setFieldErrors(fe)
        return
      }

      setError(err?.message || 'Failed to create booking')
      push({ type: 'error', message: err?.message || 'Failed to create booking' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 12 }} aria-live="polite">
      <h3 style={{marginBottom:8,color:'var(--primary)'}}>Guest details</h3>
      <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required error={fieldErrors.firstName} />
      <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required error={fieldErrors.lastName} />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required error={fieldErrors.email} />

      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <label style={{ flex: 1 }}>
          <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>Check-in</div>
          <input className="input" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={today} required aria-invalid={!!fieldErrors.checkIn} />
          {fieldErrors.checkIn && <div role="alert" style={{ color: 'red', fontSize: 13 }}>{fieldErrors.checkIn}</div>}
        </label>
        <label style={{ flex: 1 }}>
          <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>Check-out</div>
          <input className="input" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={minCheckout} required aria-invalid={!!fieldErrors.checkOut} />
          {fieldErrors.checkOut && <div role="alert" style={{ color: 'red', fontSize: 13 }}>{fieldErrors.checkOut}</div>}
        </label>
      </div>

      <div style={{ height: 8 }} />
      <label>
        <div style={{ marginBottom: 6, fontSize: 12, color: 'var(--muted)' }}>Guests (max {room.capacity})</div>
        <input className="input" type="number" min={1} max={room.capacity} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} aria-invalid={!!fieldErrors.guestCount} />
        {fieldErrors.guestCount && <div role="alert" style={{ color: 'red', fontSize: 13 }}>{fieldErrors.guestCount}</div>}
      </label>

      <div className="summary" style={{ marginTop: 8 }}>
        <div className="row"><span>Nights</span><strong>{nights}</strong></div>
        <div className="row total"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
      </div>

      {error && <div role="alert" style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div role="status" style={{ color: 'green', marginTop: 8 }}>{success}</div>}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button type="submit" variant="secondary" disabled={loading}>{loading ? 'Booking...' : 'Confirm Booking'}</Button>
        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}
