import React, { useState } from 'react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import { Room } from '../../types'
import BookingForm from './BookingForm'

export default function RoomCard({ room }: { room: Room }){
  const [showBooking, setShowBooking] = useState(false)

  return (
    <Card>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div>
          <div style={{fontWeight:800,color:'var(--primary)'}}>{room.roomNumber} • {room.roomType}</div>
          <div style={{fontSize:12,color:'var(--muted)'}}>Capacity: {room.capacity}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:800}}>${room.basePrice.toFixed(2)}</div>
          <div style={{fontSize:12,color:'var(--muted)'}}>{room.status}</div>
        </div>
      </div>

      <p className="muted" style={{marginTop:8}}>Comfortable room with essentials for a pleasant stay.</p>

      <div style={{display:'flex',gap:8,marginTop:12}}>
        <Button variant="secondary" onClick={() => setShowBooking(true)}>Book now</Button>
        <Button variant="ghost">View</Button>
      </div>

      {showBooking && (
        <div style={{marginTop:12}}>
          <BookingForm room={room} onClose={() => setShowBooking(false)} />
        </div>
      )}
    </Card>
  )
}
