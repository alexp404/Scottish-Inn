import request from 'supertest'
import { app } from '../index'
import pool from '../utils/db'

describe('Signup Integration Tests', () => {
  afterAll(async () => {
    await pool.end()
  })

  describe('POST /api/auth/register', () => {
    const testEmail = `test${Date.now()}@example.com`

    it('should successfully register a new user and save to database', async () => {
      const userData = {
        email: testEmail,
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      // Verify response structure
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user).toHaveProperty('email', testEmail)
      expect(response.body.user).toHaveProperty('first_name', 'John')
      expect(response.body.user).toHaveProperty('last_name', 'Doe')
      expect(response.body.user).not.toHaveProperty('password_hash')

      // Verify user exists in database
      const dbResult = await pool.query(
        'SELECT id, email, first_name, last_name, is_verified, is_active, is_staff, is_admin FROM users WHERE email = $1',
        [testEmail]
      )

      expect(dbResult.rows.length).toBe(1)
      const dbUser = dbResult.rows[0]
      expect(dbUser.email).toBe(testEmail)
      expect(dbUser.first_name).toBe('John')
      expect(dbUser.last_name).toBe('Doe')
      expect(dbUser.is_verified).toBe(true)
      expect(dbUser.is_active).toBe(true)
      expect(dbUser.is_staff).toBe(false)
      expect(dbUser.is_admin).toBe(false)
    })

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: testEmail, // Using same email from previous test
        password: 'TestPass123!',
        firstName: 'Jane',
        lastName: 'Smith'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/already exists/i)
    })

    it('should reject weak passwords', async () => {
      const userData = {
        email: `test${Date.now()}@example.com`,
        password: 'weak',
        firstName: 'Test',
        lastName: 'User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/password/i)
      expect(response.body).toHaveProperty('errors')
    })

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPass123!'
          // Missing firstName and lastName
        })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toMatch(/required/i)
    })

    it('should hash password before storing in database', async () => {
      const testEmail2 = `test${Date.now()}@example.com`
      const plainPassword = 'TestPass123!'

      await request(app)
        .post('/api/auth/register')
        .send({
          email: testEmail2,
          password: plainPassword,
          firstName: 'Test',
          lastName: 'User'
        })
        .expect(201)

      // Verify password is hashed in database
      const dbResult = await pool.query(
        'SELECT password_hash FROM users WHERE email = $1',
        [testEmail2]
      )

      const passwordHash = dbResult.rows[0].password_hash
      expect(passwordHash).toBeDefined()
      expect(passwordHash).not.toBe(plainPassword)
      expect(passwordHash).toMatch(/^\$2[aby]\$/)  // bcrypt hash format
    })
  })
})
