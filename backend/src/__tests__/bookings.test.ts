import request from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import bookingsRoutes from '../routes/bookings'

const app = express()
app.use(bodyParser.json())
app.use('/', bookingsRoutes)

describe('POST /api/bookings', () => {
  it('returns 400 on invalid payload', async () => {
    const res = await request(app).post('/api/bookings').send({})
    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })
})
