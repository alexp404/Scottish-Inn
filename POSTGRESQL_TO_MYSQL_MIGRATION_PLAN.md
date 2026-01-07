# ?? PostgreSQL to MySQL Migration Plan - Scottish Inn & Suites

**Project:** Hotel Management System  
**Current DB:** PostgreSQL 12+  
**Target DB:** MySQL 8.0+  
**Migration Type:** Full database migration  
**Risk Level:** MEDIUM-HIGH (requires breaking changes)  

---

## ?? EXECUTIVE SUMMARY

### Migration Scope:
- **Database Schema:** 11 tables + 2 security extensions
- **SQL Queries:** 60+ queries across 12 route files
- **PostgreSQL-Specific Features Used:**
  - UUID with `gen_random_uuid()`
  - JSONB columns (4 tables)
  - Generated columns (1 table)
  - PostgreSQL extensions (`pgcrypto`)
  - `TIMESTAMP` vs `DATETIME`
  - `SERIAL` vs `AUTO_INCREMENT`

### Estimated Time:
- **Planning & Review:** 2-3 hours
- **Schema Conversion:** 3-4 hours
- **Code Updates:** 4-6 hours
- **Testing:** 4-6 hours
- **Data Migration (if needed):** 2-4 hours
- **Total:** 15-23 hours

### Risk Assessment:
- ?? **BREAKING CHANGES:** Yes (UUID format, data types)
- ?? **DATA LOSS RISK:** Low (with proper backup)
- ?? **DOWNTIME REQUIRED:** Yes (30-60 minutes)
- ?? **ROLLBACK COMPLEXITY:** Medium (requires backup)

---

## ?? CRITICAL BREAKING CHANGES (REQUIRES APPROVAL)

### 1. UUID to VARCHAR(36) Conversion ??
**Current:** PostgreSQL UUID type with `gen_random_uuid()`  
**New:** MySQL CHAR(36) with generated UUIDs

**Impact:**
- All primary keys change from UUID to CHAR(36)
- Foreign keys need updating
- Existing data needs conversion
- API responses may change format (cosmetic only)

**Tables Affected:**
- `users` (id)
- `rooms` (id)
- `bookings` (id, room_id, user_id)
- `daily_pricing` (id, room_id)
- `firetv_devices` (id, room_id, device_id)
- `firetv_command_logs` (id, device_id)
- `payments` (id, booking_id)
- `email_logs` (id, booking_id, user_id)
- `pms_sync_log` (id)
- `sessions` (id, user_id)
- `password_reset_tokens` (id, user_id)

**Recommendation:** ? **APPROVED - Standard migration practice**

---

### 2. JSONB to JSON Conversion ??
**Current:** PostgreSQL JSONB (binary JSON with indexing)  
**New:** MySQL JSON (native JSON type in MySQL 8.0+)

**Impact:**
- JSONB operators (`->`, `->>`, `@>`) need conversion
- Indexing strategy changes
- Query performance may differ
- Storage format changes (JSONB is binary, JSON is text-based in MySQL)

**Tables Affected:**
- `users.preferences` (JSONB)
- `rooms.amenities` (JSONB)
- `rooms.images` (JSONB)
- `firetv_command_logs.parameters` (JSONB)
- `firetv_command_logs.response` (JSONB)
- `payments.payment_processor_response` (JSONB)

**Recommendation:** ?? **NEEDS REVIEW - Query performance impact**

**Question:** Do you want to:
- A) Keep JSON (native MySQL JSON - recommended)
- B) Convert to TEXT with JSON validation
- C) Normalize some JSON fields to separate tables

---

### 3. Generated Column Syntax Change ??
**Current:** PostgreSQL `GENERATED ALWAYS AS (...) STORED`  
**New:** MySQL `GENERATED ALWAYS AS (...) STORED` or `VIRTUAL`

**Impact:**
- `daily_pricing.final_price` calculation needs syntax adjustment
- MySQL supports both STORED and VIRTUAL generated columns
- STORED takes space but is faster for reads
- VIRTUAL computes on-the-fly (saves space)

**Table Affected:**
- `daily_pricing.final_price = base_rate * dynamic_multiplier`

**Recommendation:** ? **APPROVED - MySQL supports this natively**

---

### 4. TIMESTAMP vs DATETIME ??
**Current:** PostgreSQL `TIMESTAMP` (with timezone support)  
**New:** MySQL `DATETIME` or `TIMESTAMP`

**Impact:**
- `TIMESTAMP` in MySQL has limitations (range: 1970-2038)
- `DATETIME` is recommended (range: 1000-9999)
- Timezone handling differs
- `NOW()` works in both but behavior differs

**Recommendation:** ?? **NEEDS DECISION**

**Question:** Do you want to:
- A) Use DATETIME (recommended - no range limits)
- B) Use TIMESTAMP (MySQL convention but has 2038 problem)

---

### 5. Boolean to TINYINT(1) ??
**Current:** PostgreSQL `BOOLEAN` type  
**New:** MySQL `TINYINT(1)` or `BOOLEAN` (alias for TINYINT(1))

**Impact:**
- MySQL stores booleans as 0/1 integers
- JavaScript converts `TINYINT(1)` to boolean automatically
- No functional impact but data type changes

**Recommendation:** ? **APPROVED - Standard MySQL practice**

---

## ?? DATABASE SCHEMA ANALYSIS

### Tables Inventory (11 tables):

| Table | Rows (est) | Complexity | Migration Difficulty |
|-------|-----------|------------|---------------------|
| `users` | 10-1000 | Medium | Medium (UUID, JSONB) |
| `rooms` | 50-200 | Medium | Medium (UUID, JSONB) |
| `bookings` | 100-10000 | High | High (UUID FKs, many fields) |
| `daily_pricing` | 1000-50000 | Medium | Medium (Generated column) |
| `firetv_devices` | 50-200 | Medium | Medium (UUID FKs) |
| `firetv_command_logs` | 500-10000 | Low | Low (JSONB only) |
| `payments` | 100-10000 | Medium | Medium (UUID FKs, JSONB) |
| `email_logs` | 500-50000 | Low | Low (UUID FKs) |
| `pms_sync_log` | 100-5000 | Low | Low |
| `sessions` | 10-1000 | Medium | Medium (UUID, security) |
| `password_reset_tokens` | 10-100 | Low | Low (UUID) |

### PostgreSQL-Specific Features:

| Feature | Usage Count | MySQL Alternative |
|---------|------------|-------------------|
| UUID type | 11 tables | CHAR(36) |
| gen_random_uuid() | 11 tables | UUID() function or app-level generation |
| JSONB | 6 columns | JSON type |
| pgcrypto extension | 1 | Remove (use UUID() instead) |
| GENERATED ALWAYS AS | 1 column | GENERATED ALWAYS AS (same syntax) |
| ON DELETE CASCADE | 8 FKs | ON DELETE CASCADE (same) |
| ON DELETE SET NULL | 2 FKs | ON DELETE SET NULL (same) |

---

## ?? STEP-BY-STEP MIGRATION PLAN

### PHASE 1: PREPARATION & PLANNING (2-3 hours)

#### Step 1.1: Review Breaking Changes ?? 30 min
- [ ] Review UUID conversion strategy (see Breaking Change #1)
- [ ] Decide on JSONB ? JSON approach (see Breaking Change #2)
- [ ] Choose TIMESTAMP vs DATETIME (see Breaking Change #4)
- [ ] Get stakeholder approval for downtime window

#### Step 1.2: Backup Current Database ?? 15 min
```bash
# PostgreSQL backup
pg_dump -U hotel_user -h localhost -p 5433 hotelDB > backup_$(date +%Y%m%d).sql

# Or using environment variable
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

#### Step 1.3: Set Up MySQL Instance ?? 30 min
```bash
# Install MySQL 8.0+ (if not already installed)
# Windows: Download from https://dev.mysql.com/downloads/mysql/
# Linux: sudo apt-get install mysql-server

# Start MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE hotelDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hotel_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON hotelDB.* TO 'hotel_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Step 1.4: Install MySQL Driver ?? 15 min
```bash
cd backend
npm uninstall pg
npm install mysql2
```

#### Step 1.5: Create Migration Tracking ?? 15 min
- [ ] Create Git branch: `feature/mysql-migration`
- [ ] Document current PostgreSQL connection strings
- [ ] Create rollback checklist

---

### PHASE 2: SCHEMA CONVERSION (3-4 hours)

#### Step 2.1: Convert schema.sql ?? 2 hours

**File:** `backend/src/database/schema-mysql.sql` (NEW)

**Key Changes:**

1. **Remove PostgreSQL Extensions:**
```sql
-- REMOVE THIS:
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

2. **Convert UUIDs:**
```sql
-- PostgreSQL:
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- MySQL:
id CHAR(36) PRIMARY KEY DEFAULT (UUID())
```

3. **Convert JSONB to JSON:**
```sql
-- PostgreSQL:
preferences JSONB DEFAULT '{}'

-- MySQL:
preferences JSON DEFAULT NULL
```

4. **Convert TIMESTAMP:**
```sql
-- PostgreSQL:
created_at TIMESTAMP DEFAULT NOW()

-- MySQL (DATETIME):
created_at DATETIME DEFAULT CURRENT_TIMESTAMP

-- OR MySQL (TIMESTAMP - not recommended):
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

5. **Convert BOOLEAN:**
```sql
-- PostgreSQL:
is_active BOOLEAN DEFAULT true

-- MySQL:
is_active BOOLEAN DEFAULT 1
-- OR explicitly:
is_active TINYINT(1) DEFAULT 1
```

6. **Convert SERIAL (if any):**
```sql
-- PostgreSQL:
id SERIAL PRIMARY KEY

-- MySQL:
id INT AUTO_INCREMENT PRIMARY KEY
```

7. **Generated Column:**
```sql
-- PostgreSQL:
final_price DECIMAL(10, 2) GENERATED ALWAYS AS (base_rate * dynamic_multiplier) STORED

-- MySQL (same syntax works):
final_price DECIMAL(10, 2) GENERATED ALWAYS AS (base_rate * dynamic_multiplier) STORED
```

8. **Index Changes:**
```sql
-- PostgreSQL:
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- MySQL:
CREATE INDEX idx_users_email ON users(email);
-- Note: MySQL doesn't have IF NOT EXISTS for indexes in older versions
-- MySQL 8.0.29+ supports it
```

#### Step 2.2: Convert security-schema.sql ?? 30 min

**File:** `backend/src/database/security-schema-mysql.sql` (NEW)

Same conversions as above for:
- `sessions` table
- `password_reset_tokens` table

#### Step 2.3: Create Complete MySQL Schema ?? 1 hour

I'll create the complete converted schema in the next step.

---

### PHASE 3: CODE UPDATES (4-6 hours)

#### Step 3.1: Update Database Connection ?? 30 min

**File:** `backend/src/utils/db.ts`

```typescript
// BEFORE (PostgreSQL):
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL || 
  process.env.DATABASE_URL_LOCAL || 
  'postgresql://hotel_user:180496@localhost:5433/hotelDB'

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
```

```typescript
// AFTER (MySQL):
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// Parse connection string or use direct config
const connectionConfig = process.env.DATABASE_URL 
  ? parseConnectionString(process.env.DATABASE_URL)
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'hotel_user',
      password: process.env.DB_PASSWORD || 'your_password',
      database: process.env.DB_NAME || 'hotelDB',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }

export const pool = mysql.createPool(connectionConfig)

export async function testConnection(){
  try{
    const [rows] = await pool.query('SELECT 1 AS result')
    return Array.isArray(rows) && rows.length > 0
  }catch(err){
    console.error('DB connection test failed:', err)
    return false
  }
}

// Helper to parse PostgreSQL-style connection string
function parseConnectionString(connStr: string){
  const url = new URL(connStr.replace('postgresql://', 'mysql://'))
  return {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
}
```

#### Step 3.2: Update Query Syntax (60+ queries) ?? 3-4 hours

**Key Differences:**

1. **Parameter Placeholders:**
```typescript
// PostgreSQL ($1, $2, $3):
await pool.query('SELECT * FROM users WHERE email = $1', [email])

// MySQL (?, ?, ?):
await pool.query('SELECT * FROM users WHERE email = ?', [email])
```

2. **Return Value Format:**
```typescript
// PostgreSQL:
const result = await pool.query('SELECT * FROM users')
const users = result.rows // Array of objects
const count = result.rowCount // Number of rows

// MySQL (mysql2/promise):
const [rows, fields] = await pool.query('SELECT * FROM users')
const users = rows // Already an array of objects
const count = rows.length // Use .length
```

3. **INSERT RETURNING:**
```typescript
// PostgreSQL:
const result = await pool.query(
  'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
  [email, hash]
)
const user = result.rows[0]

// MySQL (no RETURNING - use insertId):
const [result] = await pool.query(
  'INSERT INTO users (id, email, password_hash) VALUES (UUID(), ?, ?)',
  [email, hash]
)
const insertId = result.insertId // May not work with UUID
// Better: Use UUID() in query and SELECT afterwards
const userId = uuidv4() // Generate in code
await pool.query(
  'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
  [userId, email, hash]
)
const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId])
const user = rows[0]
```

4. **JSONB Operators:**
```typescript
// PostgreSQL JSONB:
await pool.query(
  "SELECT * FROM users WHERE preferences->>'theme' = $1",
  ['dark']
)

// MySQL JSON:
await pool.query(
  "SELECT * FROM users WHERE JSON_EXTRACT(preferences, '$.theme') = ?",
  ['dark']
)
// OR using ->:
await pool.query(
  "SELECT * FROM users WHERE preferences->'$.theme' = ?",
  ['"dark"'] // Note: needs quotes for string matching
)
```

**Files to Update (in order of query count):**

| File | Queries | Estimated Time |
|------|---------|----------------|
| `auth.ts` | 21 | 1.5 hours |
| `twoFactor.ts` | 7 | 30 min |
| `bookings.ts` | 7 | 45 min |
| `devices.ts` | 6 | 30 min |
| `adminReports.ts` | 6 | 30 min |
| `payments.ts` | 5 | 30 min |
| `sessions.ts` | 3 | 15 min |
| `availability.ts` | 2 | 15 min |
| `users.ts` | 2 | 15 min |
| `guestBookings.ts` | 1 | 10 min |

#### Step 3.3: Update Migration Script ?? 30 min

**File:** `backend/src/utils/migrate.ts`

```typescript
import fs from 'fs'
import path from 'path'
import { pool } from './db'

async function run(){
  const file = path.resolve(__dirname, '..', 'database', 'schema-mysql.sql')
  if (!fs.existsSync(file)){
    console.error('schema-mysql.sql not found at', file)
    process.exit(1)
  }

  const sql = fs.readFileSync(file, 'utf8')
  
  // Split by semicolons for MySQL (it doesn't support multi-statement by default)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  try{
    console.log(`Running ${statements.length} migration statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i]
      console.log(`[${i+1}/${statements.length}] Executing...`)
      await pool.query(stmt)
    }
    
    console.log('? Migrations completed successfully')
    await pool.end()
    process.exit(0)
  }catch(err:any){
    console.error('? Migration error:', err?.message ?? err)
    if (err?.sql) console.error('Failed SQL:', err.sql)
    if (err?.stack) console.error(err.stack)
    await pool.end()
    process.exit(1)
  }
}

run()
```

#### Step 3.4: Update Environment Variables ?? 15 min

**File:** `backend/.env`

```bash
# BEFORE (PostgreSQL):
DATABASE_URL=postgresql://hotel_user:180496@localhost:5433/hotelDB

# AFTER (MySQL - Option 1: Connection String):
DATABASE_URL=mysql://hotel_user:your_password@localhost:3306/hotelDB

# AFTER (MySQL - Option 2: Individual vars):
DB_HOST=localhost
DB_PORT=3306
DB_USER=hotel_user
DB_PASSWORD=your_password
DB_NAME=hotelDB
```

---

### PHASE 4: TESTING (4-6 hours)

#### Step 4.1: Unit Test Database Connection ?? 30 min
```bash
npm run migrate # Should run without errors
npm test # Run existing tests
```

#### Step 4.2: Test Each Route ?? 3 hours

**Checklist:**
- [ ] **Auth Routes** (`/api/auth/*`)
  - [ ] Register user
  - [ ] Login user
  - [ ] Refresh token
  - [ ] Logout
  - [ ] Password reset request
  - [ ] Password reset confirm

- [ ] **Bookings** (`/api/bookings/*`)
  - [ ] Create booking
  - [ ] List bookings
  - [ ] Get booking by ID
  - [ ] Update booking
  - [ ] Cancel booking

- [ ] **Rooms** (`/api/rooms`)
  - [ ] List rooms
  - [ ] Get room by ID

- [ ] **Availability** (`/api/availability`)
  - [ ] Check availability

- [ ] **Payments** (`/api/payments/*`)
  - [ ] Create payment intent
  - [ ] Process payment

- [ ] **Admin Features**
  - [ ] Admin stats
  - [ ] Reports
  - [ ] Device management

#### Step 4.3: Integration Testing ?? 1.5 hours
- [ ] End-to-end booking flow
- [ ] User registration ? login ? booking
- [ ] Payment processing
- [ ] Email sending
- [ ] Session management

#### Step 4.4: Performance Testing ?? 1 hour
```bash
# Compare query performance
# PostgreSQL vs MySQL for:
# - Simple SELECT
# - JOIN queries
# - JSON queries
# - Aggregate queries
```

---

### PHASE 5: DATA MIGRATION (if existing data) (2-4 hours)

#### Step 5.1: Export PostgreSQL Data ?? 1 hour
```bash
# Export each table as CSV
psql -U hotel_user -d hotelDB -c "\COPY users TO 'users.csv' CSV HEADER"
psql -U hotel_user -d hotelDB -c "\COPY rooms TO 'rooms.csv' CSV HEADER"
psql -U hotel_user -d hotelDB -c "\COPY bookings TO 'bookings.csv' CSV HEADER"
# ... repeat for all tables
```

#### Step 5.2: Transform Data ?? 1-2 hours

**UUID Conversion Script:**
```javascript
// convert-uuids.js
const fs = require('fs')
const csv = require('csv-parser')
const createCsvWriter = require('csv-writer').createObjectCsvWriter

async function convertUUIDs(inputFile, outputFile) {
  const records = []
  
  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', (row) => {
      // UUIDs remain the same string format
      // PostgreSQL UUID: 550e8400-e29b-41d4-a716-446655440000
      // MySQL CHAR(36):  550e8400-e29b-41d4-a716-446655440000
      // No conversion needed! Just ensure proper format
      records.push(row)
    })
    .on('end', async () => {
      const csvWriter = createCsvWriter({
        path: outputFile,
        header: Object.keys(records[0]).map(key => ({id: key, title: key}))
      })
      
      await csvWriter.writeRecords(records)
      console.log(`? Converted ${inputFile} -> ${outputFile}`)
    })
}

// Run for each table
convertUUIDs('users.csv', 'users-mysql.csv')
// ... etc
```

#### Step 5.3: Import to MySQL ?? 30-60 min
```sql
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Import data
LOAD DATA INFILE '/path/to/users-mysql.csv'
INTO TABLE users
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Repeat for all tables in dependency order:
-- 1. users
-- 2. rooms
-- 3. bookings
-- 4. payments
-- 5. firetv_devices
-- 6. etc.

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
```

---

### PHASE 6: DEPLOYMENT (30-60 min)

#### Step 6.1: Deploy to Staging ?? 20 min
- [ ] Deploy code changes to staging environment
- [ ] Update staging environment variables
- [ ] Run migrations on staging database
- [ ] Smoke test all critical features

#### Step 6.2: Production Deployment ?? 30-40 min

**Deployment Checklist:**
- [ ] Announce maintenance window (30-60 min)
- [ ] Take final PostgreSQL backup
- [ ] Stop application server
- [ ] Update production environment variables
- [ ] Run MySQL migrations
- [ ] Import data (if migrating existing)
- [ ] Start application server
- [ ] Verify health check endpoint
- [ ] Test critical user flows
- [ ] Monitor error logs for 1 hour

#### Step 6.3: Rollback Plan (if needed) ?? 15 min

**If migration fails:**
```bash
# 1. Stop application
# 2. Restore PostgreSQL connection
# 3. Revert code to previous version
# 4. Restart application
# 5. Verify functionality
```

---

## ?? FILES TO CREATE/MODIFY

### New Files:
1. `backend/src/database/schema-mysql.sql` ?
2. `backend/src/database/security-schema-mysql.sql` ?
3. `backend/src/database/password-reset-schema-mysql.sql` ?
4. `MYSQL_MIGRATION_GUIDE.md` ?
5. `scripts/convert-pg-to-mysql.js` ? (data conversion)

### Modified Files:
1. `backend/src/utils/db.ts` - Connection pool
2. `backend/src/utils/migrate.ts` - Migration runner
3. `backend/src/routes/auth.ts` - 21 queries
4. `backend/src/routes/twoFactor.ts` - 7 queries
5. `backend/src/routes/bookings.ts` - 7 queries
6. `backend/src/routes/devices.ts` - 6 queries
7. `backend/src/routes/adminReports.ts` - 6 queries
8. `backend/src/routes/payments.ts` - 5 queries
9. `backend/src/routes/sessions.ts` - 3 queries
10. `backend/src/routes/availability.ts` - 2 queries
11. `backend/src/routes/users.ts` - 2 queries
12. `backend/src/routes/guestBookings.ts` - 1 query
13. `backend/package.json` - Update dependencies
14. `backend/.env` - Update connection string

---

## ?? RISKS & MITIGATION

### Risk 1: Data Loss During Migration
**Likelihood:** Low  
**Impact:** Critical  
**Mitigation:**
- Multiple backups before migration
- Test migration on staging first
- Verify data integrity after import
- Keep PostgreSQL backup for 30 days

### Risk 2: Query Performance Degradation
**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:**
- Benchmark before/after
- Add missing indexes if needed
- Optimize slow queries
- Monitor query execution time

### Risk 3: JSONB Query Incompatibility
**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:**
- Test all JSON queries thoroughly
- Consider normalizing heavily-used JSON fields
- Add indexes on JSON columns if supported

### Risk 4: UUID Generation Inconsistency
**Likelihood:** Low  
**Impact:** Low  
**Mitigation:**
- Generate UUIDs in application code (using `uuid` package)
- Ensures consistent format across databases
- Already using `uuid` package in `bookings.ts`

### Risk 5: Extended Downtime
**Likelihood:** Medium  
**Impact:** High  
**Mitigation:**
- Practice migration on staging multiple times
- Prepare rollback script
- Schedule during low-traffic period
- Have team available during migration

---

## ?? SUCCESS CRITERIA

### Technical:
- [ ] All 11 tables created successfully
- [ ] All foreign key constraints working
- [ ] All 60+ queries executing correctly
- [ ] All tests passing
- [ ] No data loss during migration
- [ ] Response times within acceptable range

### Business:
- [ ] All user-facing features working
- [ ] Booking flow functional
- [ ] Payment processing working
- [ ] Email notifications sending
- [ ] Admin dashboard operational
- [ ] FireTV controls functional

### Operations:
- [ ] Migration completed within planned downtime
- [ ] Rollback plan tested and ready
- [ ] Monitoring and alerts configured
- [ ] Team trained on MySQL differences
- [ ] Documentation updated

---

## ?? DECISION POINTS REQUIRING APPROVAL

### ?? IMMEDIATE DECISIONS NEEDED:

1. **JSONB Strategy** (Breaking Change #2)
   - Option A: Use MySQL JSON type (recommended)
   - Option B: Convert to TEXT
   - Option C: Normalize to separate tables
   - **?? YOUR DECISION: _____________**

2. **Date/Time Fields** (Breaking Change #4)
   - Option A: Use DATETIME (recommended - no limits)
   - Option B: Use TIMESTAMP (MySQL standard - 2038 limit)
   - **?? YOUR DECISION: _____________**

3. **Migration Approach**
   - Option A: New MySQL database (fresh start - no data)
   - Option B: Migrate existing PostgreSQL data
   - **?? YOUR DECISION: _____________**

4. **UUID Generation**
   - Option A: MySQL UUID() function
   - Option B: Application-level (uuidv4() in Node.js)
   - **?? YOUR DECISION: _____________**

5. **Deployment Timeline**
   - Option A: Immediate (this week)
   - Option B: Staged (2-3 weeks)
   - **?? YOUR DECISION: _____________**

---

## ?? COST-BENEFIT ANALYSIS

### Why Migrate to MySQL?

**Potential Benefits:**
- ? Wider hosting support
- ? Familiar to more developers
- ? Potentially lower cloud costs
- ? Better tooling for some use cases
- ? Simpler replication setup

**Potential Drawbacks:**
- ? Migration effort (15-23 hours)
- ? Risk of data loss/corruption
- ? Downtime required
- ? Learning curve for team
- ? JSONB capabilities limited

**Recommendation:**
?? **Consider if migration is truly necessary** - PostgreSQL is excellent for this use case. Only migrate if you have a specific business requirement (e.g., hosting constraints, team expertise, cost savings).

---

## ?? NEXT STEPS

### Immediate (Before Starting):
1. **Review this plan** - Ensure all sections understood
2. **Make decisions** - Answer all 5 decision points above
3. **Get approval** - Stakeholder sign-off on breaking changes
4. **Schedule** - Pick migration window (low-traffic time)

### After Approval:
1. **Create MySQL schema files** - I'll generate complete SQL
2. **Update db.ts** - Convert to mysql2
3. **Update all route files** - Convert queries one by one
4. **Test thoroughly** - Every endpoint, every feature
5. **Deploy to staging** - Full test run
6. **Deploy to production** - With rollback ready

---

## ? QUESTIONS FOR YOU

Before I proceed with creating the MySQL schema and code changes:

1. **Do you approve the UUID ? CHAR(36) conversion?** (Standard practice)
2. **Which JSONB strategy do you prefer?** (A, B, or C above)
3. **DATETIME or TIMESTAMP for date fields?** (DATETIME recommended)
4. **Are you migrating existing data or starting fresh?**
5. **When do you want to do this migration?** (Now or later)
6. **Why are you migrating from PostgreSQL?** (To ensure we're solving the right problem)

**Please answer these questions, and I'll generate all the MySQL schemas and code updates for you!**

---

*Plan created: 2024-01-15*  
*Estimated effort: 15-23 hours*  
*Risk level: MEDIUM-HIGH*  
*Approval required: YES*
