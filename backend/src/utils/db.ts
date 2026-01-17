import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()


const dbConfig: any = {
  host: process.env.DB_HOST || '74.208.225.120',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '462Nn5461020!',
  database: process.env.DB_NAME || 'hotelDB',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10,
  queueLimit: 0,
}

let mysqlPool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (!mysqlPool) {
    console.log('[Database] Creating MySQL connection pool...')
    mysqlPool = mysql.createPool(dbConfig)
  }
  return mysqlPool
}

export async function testConnection() {
  try {
    const p = getPool()
    const conn = await p.getConnection()
    conn.release()
    return true
  } catch (err) {
    return false
  }
}

export async function initializeDatabase() {
  try {
    const testPool = getPool()
    const connection = await testPool.getConnection()
    console.log('[Database] Connection established successfully.')
    try {
      const [databases] = await connection.query('SHOW DATABASES LIKE ?', [dbConfig.database])
      if (Array.isArray(databases) && databases.length === 0) {
        console.log(`[Database] Database "${dbConfig.database}" does not exist.`)
      }
      console.log('[Database] Database initialization complete.')
    } finally {
      connection.release()
    }
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED') {
      console.log('[Database] Connection refused. Please check your database server.')
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('[Database] Access denied. Please check your database credentials.')
    } else if (err.code === 'ENOTFOUND') {
      console.log('[Database] Database host not found. Please check your database host configuration.')
    } else {
      console.log('[Database] An error occurred while connecting to the database:', err.message || err)
    }
    throw err
  }
}

export async function query(sql: string, params: any[] = []) {
  const connection = await getPool().getConnection()
  try {
    const [rows] = await connection.query(sql, params)
    return rows
  } finally {
    connection.release()
  }
}

export async function queryOne(sql: string, params: any[] = []) {
  const rows: any = await query(sql, params)
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null
}

export async function closePool() {
  if (mysqlPool) {
    await mysqlPool.end()
    mysqlPool = null
    console.log('🔒 [Database] Connection pool closed')
  }
}

function toMySqlParams(sql: string): string {
  return sql.replace(/\$\d+/g, '?')
}

export const pool: any = {
  async query(sql: string, params: any[] = []) {
    const converted = toMySqlParams(sql)
    const rows = await query(converted, params)
    return { rows, rowCount: Array.isArray(rows) ? rows.length : 0 }
  }
}

export default { getPool, query, queryOne, closePool, initializeDatabase }
