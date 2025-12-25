export interface DeviceStatus {
  power: 'on' | 'off' | 'unknown'
  volume: number
  channel: number
  channelName?: string
  inputSource?: string
  muted?: boolean
}

export interface FireTVChannel {
  number: number
  name: string
  isAvailable: boolean
  logoUrl?: string
}

export interface Room {
  id: string
  roomNumber: string
  roomType: string
  capacity: number
  basePrice: number
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance'
}
