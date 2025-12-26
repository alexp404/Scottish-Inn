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
const startTime = Date.now()

app.use(requestId)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(bodyParser.json())

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbOk = await testConnection()
    const uptime = Math.floor((Date.now() - startTime) / 1000)
    
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime,
      database: dbOk ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    })
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    })
  }
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Scottish Inn & Suites API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      rooms: '/api/rooms',
      bookings: '/api/bookings',
      availability: '/api/availability'
    }
  })
})

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
    console.log('? Database connection OK:', ok)
    console.log('?? Environment:', process.env.NODE_ENV || 'development')
    console.log('?? Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:5173')
  } catch (err) {
    console.warn(
      '??  Database connection failed. Make sure migrations have run and DATABASE_URL is correct.',
      err
    )
  }

  app.listen(PORT, () => {
    console.log(`?? Backend API running on http://localhost:${PORT}`)
    console.log(`?? Health check: http://localhost:${PORT}/api/health`)
  })
}

start()

export { app }
