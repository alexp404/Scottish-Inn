import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// Parse connection string or use individual config
function getConnectionConfig() {
  const connStr = process.env.DATABASE_URL || process.env.DATABASE_URL_LOCAL
  
  if (connStr) {
    // Parse connection string (supports both postgresql:// and mysql:// formats)
    try {
      const url = new URL(connStr.replace('postgresql://', 'mysql://'))
      return {
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: url.password,
        database: url.pathname.substring(1),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      }
    } catch (err) {
      console.error('Error parsing DATABASE_URL:', err)
    }
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'hotel_user',
    password: process.env.DB_PASSWORD || '180496',
    database: process.env.DB_NAME || 'hotelDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  }
}

export const pool = mysql.createPool(getConnectionConfig())

export async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 AS result')
    return Array.isArray(rows) && rows.length > 0
  } catch (err) {
    console.error('Database connection test failed:', err)
    return false
  }
}

// Helper function to execute queries (maintains similar interface to pg)
export async function query(sql: string, params?: any[]) {
  const [rows, fields] = await pool.query(sql, params)
  return { rows, fields }
}
