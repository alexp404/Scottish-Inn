import { render, screen, fireEvent } from '@testing-library/react'
import BookingForm from '../components/domain/BookingForm'
import { Room } from '../types'

const room: Room = {
  id: 'r1',
  roomNumber: '101',
  roomType: 'single',
  capacity: 1,
  basePrice: 89.99,
  status: 'available',
  images: []
}

function Wrapper({ children }: { children: React.ReactNode }){
  return <div>{children}</div>
}

test('shows validation errors when required fields are missing', async () => {
  render(<BookingForm room={room} />, { wrapper: Wrapper as any })

  const submit = screen.getByRole('button', { name: /confirm booking/i })
  fireEvent.click(submit)

  expect(await screen.findByText(/first name is required/i)).toBeInTheDocument()
  expect(await screen.findByText(/last name is required/i)).toBeInTheDocument()
  expect(await screen.findByText(/valid email is required/i)).toBeInTheDocument()
  expect(await screen.findByText(/check-in date required/i)).toBeInTheDocument()
  expect(await screen.findByText(/check-out date required/i)).toBeInTheDocument()
})
