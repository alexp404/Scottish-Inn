import { Room, DeviceStatus, FireTVChannel } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || 'admin-secret'

function getAdminToken(){
  return localStorage.getItem('admin_token') || ADMIN_TOKEN
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    if (!res.ok) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('refresh_token')
      return null
    }
    const data = await res.json()
    localStorage.setItem('admin_token', data.token)
    return data.token
  } catch (err) {
    console.error('Token refresh failed:', err)
    return null
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' }
  if ((opts as any)._admin) headers['Authorization'] = `Bearer ${getAdminToken()}`

  let res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: { ...(opts.headers as any || {}), ...headers }
  })

  // If 401 and we have a refresh token, try refreshing
  if (res.status === 401 && (opts as any)._admin && localStorage.getItem('refresh_token')) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${API_BASE}${path}`, {
        ...opts,
        headers: { ...(opts.headers as any || {}), ...headers }
      })
    }
  }

  const text = await res.text()
  let payload: any = null
  try{
    payload = text ? JSON.parse(text) : null
  }catch(e){
    payload = text
  }

  if (!res.ok) {
    const message = payload?.error || payload?.message || `${res.status} ${res.statusText}`
    const err: any = new Error(message)
    err.status = res.status
    err.body = payload
    throw err
  }

  return payload as T
}

export async function fetchRooms(): Promise<Room[]> {
  const data = await request<{ rooms: Room[] }>('/api/rooms')
  return data.rooms
}

export async function fetchAvailability(params: URLSearchParams){
  const qs = params ? `?${params.toString()}` : ''
  return request<{ rooms: Room[], page: number, pageSize: number, total: number }>(`/api/availability${qs}`)
}

export async function registerGuest(payload: { email: string; password: string; firstName: string; lastName: string }){
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export async function getMe(){
  return request('/api/users/me', { method: 'GET', _admin: true })
}

export async function updateMe(payload: any){
  return request('/api/users/me', { method: 'PUT', body: JSON.stringify(payload), _admin: true })
}

export async function getMyBookings(status?: 'upcoming' | 'past'){
  const qs = status ? `?status=${status}` : ''
  return request<{ bookings: any[] }>(`/api/guests/me/bookings${qs}`, { method: 'GET', _admin: true })
}

export async function getAdminStats(){
  return request<{ occupancyRate: number; revenueToday: number; bookingsToday: number }>(`/api/admin/stats`, { method: 'GET', _admin: true })
}

export async function getDailyRevenue(){
  return request<{ rows: { date: string; revenue: number }[] }>(`/api/admin/reports/daily-revenue`, { method: 'GET', _admin: true })
}

export async function getOccupancyReport(){
  return request<{ rows: { room_number: string; current_status: string; confirmation_id?: string; first_name?: string; last_name?: string; check_out_date?: string }[] }>(`/api/admin/reports/occupancy`, { method: 'GET', _admin: true })
}

// Devices
export async function listDevices(){
  return request<{ devices: any[] }>(`/api/devices`, { method: 'GET', _admin: true })
}
export async function createDevice(payload:any){
  return request(`/api/devices`, { method: 'POST', body: JSON.stringify(payload), _admin: true })
}
export async function updateDevice(id:string, payload:any){
  return request(`/api/devices/${id}`, { method: 'PATCH', body: JSON.stringify(payload), _admin: true })
}
export async function deleteDevice(id:string){
  return request(`/api/devices/${id}`, { method: 'DELETE', _admin: true })
}
export async function getDeviceForRoom(roomId:string){
  return request(`/api/rooms/${roomId}/device`, { method: 'GET', _admin: true })
}

export async function fetchBookings(params?: URLSearchParams){
  const qs = params ? `?${params.toString()}` : ''
  return request<{ bookings: any[], page?: number, pageSize?: number, total?: number }>(`/api/bookings${qs}`, { method: 'GET', _admin: true })
}

export async function fetchBooking(id: string){
  return request<any>(`/api/bookings/${encodeURIComponent(id)}`, { method: 'GET', _admin: true })
}

export async function createBooking(payload: any){
  return request('/api/bookings', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateBooking(id:string, payload:any){
  return request(`/api/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload), _admin: true })
}

export async function cancelBooking(id:string, reason?:string){
  return request(`/api/bookings/${encodeURIComponent(id)}/cancel`, { method: 'POST', body: JSON.stringify({ reason }), _admin: true })
}

// Contact Form
export async function submitContactForm(payload: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}){
  return request('/api/contact', { method: 'POST', body: JSON.stringify(payload) })
}

// FireTV
export async function getDeviceStatus(deviceId: string): Promise<{ state: DeviceStatus }>
{
  const url = `/remote/api/status?deviceId=${encodeURIComponent(deviceId)}`
  return request(url)
}

export async function powerControl(deviceId: string, action: 'on'|'off'){
  return request('/remote/api/power/' + action, { method: 'POST', body: JSON.stringify({ deviceId }) })
}

export async function setVolume(deviceId: string, level: number){
  return request('/remote/api/volume/set', { method: 'POST', body: JSON.stringify({ deviceId, parameters: { volumeLevel: level } }) })
}

export async function getChannels(deviceId: string): Promise<{ channels: FireTVChannel[] }>{
  return request(`/remote/api/channels?deviceId=${encodeURIComponent(deviceId)}`)
}
