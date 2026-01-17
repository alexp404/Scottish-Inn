import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
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

function cors(res, req) {
    const defaultOrigin = process.env.CLIENT_URL || 'https://localhost:5173';
    const reqOrigin = req?.headers?.origin;

    // Default allowlist of trusted origins for CORS - add your production host(s) here
    const defaultAllowed = [
        process.env.CLIENT_URL || 'https://localhost:5173',
        'http://127.0.0.1:3000',
        'https://scottishinn1960.com',
        'https://scottish-inn-frontend.onrender.com',
        'https://scottish-inn-frontend.vercel.app',
        'https://scottish-inn-frontend-lex-09222e0b.vercel.app',
        `https://*.vercel.app`,
       
    ];

    // Support environment-variable based allowlist (comma-separated)
    // Example: CORS_ALLOWED_ORIGINS="https://example.com,https://app.example.com"
    const envListRaw = process.env.CORS_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || '';
    const envList = typeof envListRaw === 'string' && envListRaw.length > 0
        ? envListRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    // Merge defaults and env-provided origins, deduplicate
    const allowedOrigins = Array.from(new Set([...defaultAllowed, ...envList]));

    // Choose origin to return; if incoming origin is allowed use it, else fall back to defaultOrigin
    const originToSet = (typeof reqOrigin === 'string' && allowedOrigins.includes(reqOrigin)) ? reqOrigin : defaultOrigin;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', originToSet);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization, X-Api-Key, X-Client-Token, User-Agent');
    // Ensure caches vary by Origin
    res.setHeader('Vary', 'Origin');
}

const app = express()
const PORT = process.env.PORT || 5000
const USE_SSL = process.env.USE_SSL === 'false' ? false : true;
const startTime = Date.now()

// Enhanced health check endpoint
app.get('/api/health', async (req, res) => {
    cors(res, req);
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
  cors(res, req)
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

// CORS Configuration - Allow multiple origins for development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  'https://scottish-inn-frontend.onrender.com',
  'https://scottish-inn-frontend.vercel.app',
  'https://scottish-inn-frontend-lex-09222e0b.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(requestId)
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true)
    
    // Remove trailing slash from origin for comparison
    const normalizedOrigin = origin.replace(/\/$/, '')
    const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, ''))
    
    if (normalizedAllowed.indexOf(normalizedOrigin) !== -1) {
      console.log('✅ CORS allowed origin:', origin)
      callback(null, true)
    } else {
      console.warn('❌ CORS blocked origin:', origin)
      console.warn('📋 Allowed origins:', allowedOrigins)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

async function start() {
  try {
    const ok = await testConnection()
    console.log('? Database connection OK:', ok)
    console.log('?? Environment:', process.env.NODE_ENV || 'development')
  } catch (err) {
    console.warn('??  Database connection failed. Make sure migrations have run and DATABASE_URL is correct.', err)
  }

  if (!process.env.SERVERLESS_ENV) {
    app.listen(PORT, () => {
      console.log(`?? Backend API running on http://localhost:${PORT}`)
      console.log(`?? Health check: http://localhost:${PORT}/api/health`)
    })
  }
}

start()

export { app }
export default app
