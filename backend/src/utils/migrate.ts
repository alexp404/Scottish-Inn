import fs from 'fs'
import path from 'path'
import { pool } from './db'

async function run() {
  // MySQL schema files
  const schemaFile = path.resolve(__dirname, '..', 'database', 'schema-mysql.sql')
  const securityFile = path.resolve(__dirname, '..', 'database', 'security-schema-mysql.sql')
  const passwordResetFile = path.resolve(__dirname, '..', 'database', 'password-reset-schema-mysql.sql')

  const files = [
    { name: 'Main Schema', path: schemaFile },
    { name: 'Security Schema', path: securityFile },
    { name: 'Password Reset Schema', path: passwordResetFile }
  ]

  // Check all files exist
  for (const file of files) {
    if (!fs.existsSync(file.path)) {
      console.error(`? ${file.name} not found at ${file.path}`)
      process.exit(1)
    }
  }

  try {
    console.log('?? Running MySQL migrations...\n')

    for (const file of files) {
      console.log(`?? Processing ${file.name}...`)
      const sql = fs.readFileSync(file.path, 'utf8')

      // Split by semicolons and filter empty statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

      console.log(`   Found ${statements.length} SQL statements`)

      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i]
        try {
          await pool.query(stmt)
          process.stdout.write(`   [${i + 1}/${statements.length}] ?\r`)
        } catch (err: any) {
          console.error(`\n   ? Statement ${i + 1} failed:`)
          console.error(`   SQL: ${stmt.substring(0, 100)}...`)
          console.error(`   Error: ${err.message}`)
          throw err
        }
      }

      console.log(`\n   ? ${file.name} completed\n`)
    }

    console.log('? All migrations completed successfully!')
    await pool.end()
    process.exit(0)
  } catch (err: any) {
    console.error('\n? Migration error:', err?.message ?? err)
    if (err?.sql) {
      console.error('Failed SQL:', err.sql)
    }
    if (err?.stack) {
      console.error('\nStack trace:')
      console.error(err.stack)
    }
    await pool.end()
    process.exit(1)
  }
}

run()
