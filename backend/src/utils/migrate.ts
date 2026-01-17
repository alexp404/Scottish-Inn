import fs from 'fs'
import path from 'path'
import { getPool, queryOne, query, closePool } from './db'

async function run() {
  const file = path.resolve(__dirname, '..', 'database', 'schema.sql')
  if (!fs.existsSync(file)) {
    console.error('schema.sql not found at', file)
    process.exit(1)
  }

  const sql = fs.readFileSync(file, 'utf8')
  let client
  try {
    console.log('Running migrations...')
    client = await pool.connect()
    await client.query(sql)
    console.log('Migrations completed')
    process.exit(0)
  } catch (err: any) {
    console.error('Migration error:', err?.message ?? err)
    // If AggregateError (pg may aggregate connection errors), print contained errors
    if (Array.isArray(err?.errors)) {
      console.error('Aggregate errors:')
      err.errors.forEach((e: any, i: number) => console.error(`#${i}:`, e && e.message ? e.message : e))
    }
    // If there is a stack, print it
    if (err?.stack) console.error(err.stack)
    process.exit(1)
  } finally {
    if (client) client.release()
  }
}

run()
