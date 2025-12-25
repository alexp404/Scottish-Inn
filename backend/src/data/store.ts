import { Room } from '../types'

export const rooms: Room[] = [
  { id: '1', roomNumber: '101', roomType: 'single', capacity: 1, basePrice: 89.99, status: 'available' },
  { id: '2', roomNumber: '102', roomType: 'double', capacity: 2, basePrice: 119.99, status: 'occupied' },
  { id: '3', roomNumber: '103', roomType: 'suite', capacity: 4, basePrice: 199.99, status: 'available' }
]

// simple in-memory map of device states
export const deviceStates: Record<string, any> = {
  // deviceId -> state
  'AMZN123ABC456': { power: true, volume: 25, muted: false, channel: 45, channelName: 'HBO', inputSource: 'HDMI1', timestamp: Date.now() }
}

export const channelsByDevice: Record<string, any[]> = {
  'AMZN123ABC456': [
    { channelNumber: 2, channelName: 'ABC', isAvailable: true, logoUrl: '' },
    { channelNumber: 45, channelName: 'HBO', isAvailable: true, logoUrl: '' }
  ]
}
