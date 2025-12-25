import bcrypt from 'bcrypt'
import { pool } from '../utils/db'

async function createDefaultAdmin(){
  const email = process.env.ADMIN_USER || 'admin@hotel.com'
  const password = process.env.ADMIN_PASS || 'adminpass'

  try{
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if ((exists.rowCount || 0) > 0){
      console.log('Default admin already exists:', email)
      return
    }

    const hash = await bcrypt.hash(password, 10)
    await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, is_admin, is_verified, is_active) VALUES ($1,$2,$3,$4,true,true,true)',
      [email, hash, 'Admin', 'User']
    )
    console.log('Default admin created:', email)
  }catch(err){
    console.error('Failed to create default admin:', err)
  }
}

createDefaultAdmin()
