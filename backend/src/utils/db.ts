import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_URL_LOCAL || 'postgresql://hotel_user:180496@localhost:5433/hotelDB'

export const pool = new Pool({ connectionString })

export async function testConnection(){
  const client = await pool.connect()
  try{
    const res = await client.query('SELECT 1')
    return res.rowCount === 1
  }finally{
    client.release()
  }
}
