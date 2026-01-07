# MySQL Query Conversion Helper

This document provides patterns for converting PostgreSQL queries to MySQL.

## Common Conversions

### 1. Parameter Placeholders

**PostgreSQL:**
```typescript
await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = $2', [email, true])
```

**MySQL:**
```typescript
const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = ?', [email, true])
```

### 2. Return Value Destructuring

**PostgreSQL:**
```typescript
const result = await pool.query('SELECT * FROM users')
const users = result.rows
const count = result.rowCount
```

**MySQL:**
```typescript
const [rows] = await pool.query('SELECT * FROM users')
const users = rows
const count = rows.length
```

### 3. INSERT with RETURNING

**PostgreSQL:**
```typescript
const result = await pool.query(
  'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
  [email, hash]
)
const user = result.rows[0]
```

**MySQL (generate UUID first):**
```typescript
import { v4 as uuidv4 } from 'uuid'

const userId = uuidv4()
await pool.query(
  'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
  [userId, email, hash]
)
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId])
const user = rows[0]
```

### 4. UPDATE with RETURNING

**PostgreSQL:**
```typescript
const result = await pool.query(
  'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *',
  [false, userId]
)
const user = result.rows[0]
```

**MySQL:**
```typescript
await pool.query(
  'UPDATE users SET is_active = ? WHERE id = ?',
  [false, userId]
)
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId])
const user = rows[0]
```

### 5. JSON Operations

**PostgreSQL JSONB:**
```typescript
// Extract JSON field
await pool.query(
  "SELECT * FROM users WHERE preferences->>'theme' = $1",
  ['dark']
)

// Contains check
await pool.query(
  "SELECT * FROM users WHERE preferences @> $1",
  [JSON.stringify({ notifications: true })]
)
```

**MySQL JSON:**
```typescript
// Extract JSON field
await pool.query(
  "SELECT * FROM users WHERE JSON_UNQUOTE(JSON_EXTRACT(preferences, '$.theme')) = ?",
  ['dark']
)

// Or using ->
await pool.query(
  "SELECT * FROM users WHERE preferences->>'$.theme' = ?",
  ['dark']
)

// Contains check (requires parsing)
await pool.query(
  "SELECT * FROM users WHERE JSON_CONTAINS(preferences, ?)",
  [JSON.stringify({ notifications: true })]
)
```

### 6. Boolean Values

**PostgreSQL:**
```typescript
await pool.query('UPDATE users SET is_active = $1', [true])
await pool.query('SELECT * FROM users WHERE is_active = $1', [false])
```

**MySQL (same, but stored as TINYINT(1)):**
```typescript
await pool.query('UPDATE users SET is_active = ?', [true])  // Becomes 1
await pool.query('SELECT * FROM users WHERE is_active = ?', [false])  // Becomes 0

// Or explicitly:
await pool.query('UPDATE users SET is_active = ?', [1])
await pool.query('SELECT * FROM users WHERE is_active = ?', [0])
```

### 7. NOW() and CURRENT_TIMESTAMP

**Both PostgreSQL and MySQL:**
```typescript
// These work in both databases
await pool.query('UPDATE users SET updated_at = NOW() WHERE id = ?', [userId])
await pool.query('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [userId])
```

### 8. LIMIT and OFFSET

**PostgreSQL:**
```typescript
await pool.query('SELECT * FROM bookings LIMIT $1 OFFSET $2', [limit, offset])
```

**MySQL:**
```typescript
await pool.query('SELECT * FROM bookings LIMIT ? OFFSET ?', [limit, offset])
```

### 9. Date Functions

**PostgreSQL:**
```typescript
await pool.query(
  "SELECT * FROM bookings WHERE check_in_date >= CURRENT_DATE"
)
```

**MySQL:**
```typescript
await pool.query(
  "SELECT * FROM bookings WHERE check_in_date >= CURDATE()"
)
// Or
await pool.query(
  "SELECT * FROM bookings WHERE check_in_date >= CURRENT_DATE"
)
// Both work in MySQL 8.0+
```

### 10. ILIKE (Case-Insensitive Search)

**PostgreSQL:**
```typescript
await pool.query('SELECT * FROM users WHERE email ILIKE $1', [`%${search}%`])
```

**MySQL:**
```typescript
// LIKE is case-insensitive by default in MySQL with utf8mb4_unicode_ci collation
await pool.query('SELECT * FROM users WHERE email LIKE ?', [`%${search}%`])

// Or explicitly case-insensitive:
await pool.query('SELECT * FROM users WHERE LOWER(email) LIKE LOWER(?)', [`%${search}%`])
```

## Complete Example Conversion

### Before (PostgreSQL):

```typescript
async function createBooking(data: BookingData) {
  const insertQuery = `
    INSERT INTO bookings (
      room_id, user_id, check_in_date, check_out_date,
      first_name, last_name, email, subtotal
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `
  
  const values = [
    data.room_id,
    data.user_id,
    data.check_in_date,
    data.check_out_date,
    data.first_name,
    data.last_name,
    data.email,
    data.subtotal
  ]
  
  const result = await pool.query(insertQuery, values)
  return result.rows[0]
}
```

### After (MySQL):

```typescript
import { v4 as uuidv4 } from 'uuid'

async function createBooking(data: BookingData) {
  const bookingId = uuidv4()
  const confirmationId = generateConfirmationId() // Your function
  
  const insertQuery = `
    INSERT INTO bookings (
      id, confirmation_id, room_id, user_id, check_in_date, check_out_date,
      first_name, last_name, email, subtotal, total_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  
  const values = [
    bookingId,
    confirmationId,
    data.room_id,
    data.user_id,
    data.check_in_date,
    data.check_out_date,
    data.first_name,
    data.last_name,
    data.email,
    data.subtotal,
    data.subtotal // total_price
  ]
  
  await pool.query(insertQuery, values)
  
  // Fetch the created record
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId])
  return rows[0]
}
```

## Quick Reference Table

| PostgreSQL | MySQL | Notes |
|------------|-------|-------|
| `$1, $2, $3` | `?, ?, ?` | Parameter placeholders |
| `result.rows` | `const [rows] = ...` | Destructure result |
| `result.rowCount` | `rows.length` | Row count |
| `RETURNING *` | Generate ID + SELECT | No RETURNING in MySQL |
| `UUID` type | `CHAR(36)` | String representation |
| `gen_random_uuid()` | `uuidv4()` in code | App-level generation |
| `JSONB` | `JSON` | Similar but different ops |
| `->>'key'` | `->>
'$.key'` | JSON path syntax |
| `BOOLEAN` | `TINYINT(1)` or `BOOLEAN` | Stored as 0/1 |
| `TIMESTAMP` | `DATETIME` | Preferred for date ranges |
| `NOW()` | `NOW()` or `CURRENT_TIMESTAMP` | Both work |
| `ILIKE` | `LIKE` | Case-insensitive by default |
| `IF NOT EXISTS` | `IF NOT EXISTS` | Works in MySQL 8.0+ |

## Tips for Conversion

1. **Use destructuring** for all queries: `const [rows] = await pool.query(...)`
2. **Generate UUIDs in code** using `uuidv4()` from the `uuid` package
3. **Always SELECT after INSERT/UPDATE** if you need the record back
4. **Test JSON queries** carefully - syntax differs from PostgreSQL
5. **Booleans work automatically** - JavaScript true/false converts to 1/0
6. **LIKE is case-insensitive** by default with utf8mb4_unicode_ci
7. **Check for rowCount** - use `rows.length` instead

## Import Changes

**Add to all route files:**
```typescript
import { v4 as uuidv4 } from 'uuid'
```

**Update pool import (if using destructured query):**
```typescript
import { pool } from '../utils/db'
// The pool.query now returns [rows, fields] tuple
```
