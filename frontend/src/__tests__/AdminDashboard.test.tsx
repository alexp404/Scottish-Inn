import { render, screen } from '@testing-library/react'
import AdminDashboard from '../pages/AdminDashboard'

vi.mock('../services/api', () => ({
  fetchBookings: async () => ({ bookings: [], total: 0 }),
  getAdminStats: async () => ({ occupancyRate: 75, revenueToday: 1000, bookingsToday: 5 }),
  getDailyRevenue: async () => ({ rows: [{ date: '2025-01-01', revenue: 1000 }] }),
  getOccupancyReport: async () => ({ rows: [{ room_number: '101', current_status: 'vacant' }] })
}))

test('renders admin stats tiles', async () => {
  render(<AdminDashboard />)
  expect(await screen.findByText(/occupancy rate/i)).toBeInTheDocument()
  expect(await screen.findByText(/revenue today/i)).toBeInTheDocument()
  expect(await screen.findByText(/bookings today/i)).toBeInTheDocument()
})
