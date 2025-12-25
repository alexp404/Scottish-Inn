import request from 'supertest'
import express from 'express'
import availabilityRoutes from '../routes/availability'

const app = express()
app.use('/', availabilityRoutes)

describe('GET /api/availability', () => {
  it('returns 400 when dates are missing', async () => {
    const res = await request(app).get('/api/availability')
    expect(res.status).toBe(400)
  })
})
