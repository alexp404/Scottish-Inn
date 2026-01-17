import dotenv from 'dotenv'
dotenv.config()

import express, { Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
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

const app = express()
const PORT = process.env.PORT || 5000
const startTime = Date.now()

// Build allowed origins list from multiple sources
const buildAllowedOrigins = (): string[] => {
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://scottishinn1960.com',
    'https://scottish-inn-frontend.onrender.com',
    'https://scottish-inn-frontend.vercel.app',
    'https://scottish-inn-frontend-lex-09222e0b.vercel.app',
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL
  ].filter(Boolean) as string[]

  // Support environment-variable based allowlist (comma-separated)
  const envListRaw = process.env.CORS_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || ''
  const envList = envListRaw.length > 0
    ? envListRaw.split(',').map(s => s.trim()).filter(Boolean)
    : []

  // Merge and deduplicate
  return Array.from(new Set([...defaultOrigins, ...envList]))
}

const allowedOrigins = buildAllowedOrigins()

// Apply middleware BEFORE routes
app.use(requestId)
app.use(bodyParser.json())
app.use(cors({
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (mobile apps, curl, postman, server-to-server)
    if (!origin) {
      console.log('✅ CORS allowed: no origin (server-to-server request)')
      return callback(null, true)
    }
    
    // Normalize origins by removing trailing slashes
    const normalizedOrigin = origin.replace(/\/$/, '')
    const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, ''))
    
    // Check if origin is allowed
    if (normalizedAllowed.includes(normalizedOrigin)) {
      console.log('✅ CORS allowed origin:', origin)
      callback(null, true)
    } else {
      console.warn('❌ CORS blocked origin:', origin)
      console.warn('📋 Allowed origins:', allowedOrigins.join(', '))
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'X-Client-Token', 'User-Agent'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}))

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
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
app.get('/', (req: Request, res: Response) => {
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

// Register API routes
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

// Error handler (must be last)
app.use(errorHandler)

async function start() {
  try {
    const ok = await testConnection()
    console.log('✅ Database connection OK:', ok)
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development')
    console.log('🔒 Allowed CORS origins:', allowedOrigins.length, 'configured')
  } catch (err) {
    console.warn('⚠️  Database connection failed. Make sure migrations have run and DB credentials are correct.', err)
  }

  // Only start HTTP server if not running in serverless environment
  if (!process.env.SERVERLESS_ENV) {
    app.listen(PORT, () => {
      console.log(`🚀 Backend API running on http://localhost:${PORT}`)
      console.log(`❤️  Health check: http://localhost:${PORT}/api/health`)
    })
  }
}

start()

export { app }
export default app
