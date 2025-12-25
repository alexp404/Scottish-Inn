export interface Room {
  id: string
  roomNumber: string
  roomType: string
  capacity: number
  basePrice: number
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance'
  images: string[]
}

export interface DeviceStatus {
  power: 'on' | 'off' | 'unknown'
  volume: number
  channel: number
  channelName?: string
  inputSource?: string
  muted?: boolean
}

export interface FireTVChannel {
  channelNumber: number
  channelName: string
  isAvailable: boolean
  logoUrl?: string
}

export interface Booking {
  id?: string
  room_id: string
  first_name: string
  last_name: string
  email: string
  check_in_date: string
  check_out_date: string
  guest_count: number
  subtotal: number
}
