import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import firetvRoutes from './routes/firetv'
import roomsRoutes from './routes/rooms'
import bookingsRoutes from './routes/bookings'
import authRoutes from './routes/auth'
import twoFactorRoutes from './routes/twoFactor'
import sessionsRoutes from './routes/sessions'
import availabilityRoutes from './routes/availability'
import paymentsRoutes from './routes/payments'
import usersRoutes from './routes/users'
import guestBookingsRoutes from './routes/guestBookings'
import adminReportsRoutes from './routes/adminReports'
import devicesRoutes from './routes/devices'
import requestId from './middleware/requestId'
import errorHandler from './middleware/errorHandler'
import { testConnection } from './utils/db'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(requestId)
app.use(cors())
app.use(bodyParser.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/', authRoutes)
app.use('/', twoFactorRoutes)
app.use('/', sessionsRoutes)
app.use('/', availabilityRoutes)
app.use('/', paymentsRoutes)
app.use('/', usersRoutes)
app.use('/', guestBookingsRoutes)
app.use('/', adminReportsRoutes)
app.use('/', devicesRoutes)
app.use('/', firetvRoutes)
app.use('/', roomsRoutes)
app.use('/', bookingsRoutes)

app.use(errorHandler)

async function start() {
  try {
    const ok = await testConnection()
    console.log('Database connection OK:', ok)
  } catch (err) {
    console.warn(
      'Database connection failed. Make sure migrations have run and DATABASE_URL is correct.',
      err
    )
  }

  app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`)
  })
}

start()
