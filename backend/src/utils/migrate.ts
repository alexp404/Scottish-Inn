import fs from 'fs'
import path from 'path'
import { getPool } from './db'

async function run() {
  const file = path.resolve(__dirname, '..', 'database', 'schema.sql')
  if (!fs.existsSync(file)) {
    console.error('schema.sql not found at', file)
    process.exit(1)
  }

  const sql = fs.readFileSync(file, 'utf8')
  try {
    console.log('Running migrations...')
    const pool = getPool()
    await pool.query(sql)
    console.log('Migrations completed')
    process.exit(0)
  } catch (err: any) {
    console.error('Migration error:', err?.message ?? err)
    process.exit(1)
  }
}

run()
