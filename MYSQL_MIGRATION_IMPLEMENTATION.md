# ?? MySQL Migration - Implementation Guide

## ? FILES CREATED

All MySQL schema files and updated code have been created:

### 1. Database Schemas (MySQL 8.0+)
- ? `backend/src/database/schema-mysql.sql` - Main schema (11 tables)
- ? `backend/src/database/security-schema-mysql.sql` - Security tables
- ? `backend/src/database/password-reset-schema-mysql.sql` - Auth tokens

### 2. Updated Core Files
- ? `backend/src/utils/db.ts` - MySQL connection with mysql2/promise
- ? `backend/src/utils/migrate.ts` - MySQL migration runner

### 3. Documentation
- ? `MYSQL_QUERY_CONVERSION_GUIDE.md` - Query conversion patterns
- ? `MYSQL_MIGRATION_QUICK_REF.md` - Quick reference
- ? `POSTGRESQL_TO_MYSQL_MIGRATION_PLAN.md` - Complete plan

---

## ?? STEP 1: UPDATE DEPENDENCIES (5 minutes)

### Uninstall PostgreSQL Package:
```bash
cd backend
npm uninstall pg @types/pg
```

### Install MySQL Package:
```bash
npm install mysql2
```

Your `package.json` dependencies should now include:
```json
{
  "dependencies": {
    "mysql2": "^3.6.5",
    // ... other dependencies (bcrypt, express, etc.)
  }
}
```

---

## ??? STEP 2: SET UP MYSQL DATABASE (15 minutes)

### Option A: Local MySQL Installation

**Windows:**
1. Download MySQL 8.0+ from https://dev.mysql.com/downloads/mysql/
2. Run installer, set root password
3. Start MySQL service

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install mysql-server-8.0

# macOS (with Homebrew)
brew install mysql@8.0
brew services start mysql@8.0
```

### Option B: Docker MySQL

```bash
docker run --name scottish-inn-mysql \
  -e MYSQL_ROOT_PASSWORD=your_root_password \
  -e MYSQL_DATABASE=hotelDB \
  -e MYSQL_USER=hotel_user \
  -e MYSQL_PASSWORD=180496 \
  -p 3306:3306 \
  -d mysql:8.0
```

### Create Database and User:

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE hotelDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'hotel_user'@'localhost' IDENTIFIED BY '180496';

-- Grant privileges
GRANT ALL PRIVILEGES ON hotelDB.* TO 'hotel_user'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES;
SELECT User, Host FROM mysql.user WHERE User = 'hotel_user';

-- Exit
EXIT;
```

---

## ?? STEP 3: UPDATE ENVIRONMENT VARIABLES (5 minutes)

### Update `backend/.env`:

**Option 1: Connection String (Recommended)**
```env
# OLD (PostgreSQL):
# DATABASE_URL=postgresql://hotel_user:180496@localhost:5433/hotelDB

# NEW (MySQL):
DATABASE_URL=mysql://hotel_user:180496@localhost:3306/hotelDB

# Or with explicit host:
DATABASE_URL=mysql://hotel_user:180496@127.0.0.1:3306/hotelDB
```

**Option 2: Individual Variables**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=hotel_user
DB_PASSWORD=180496
DB_NAME=hotelDB
```

---

## ??? STEP 4: RUN MIGRATIONS (5 minutes)

```bash
cd backend

# Run the migration
npm run migrate

# Expected output:
# ?? Running MySQL migrations...
# 
# ?? Processing Main Schema...
#    Found X SQL statements
#    [X/X] ?
#    ? Main Schema completed
# 
# ?? Processing Security Schema...
#    Found X SQL statements
#    [X/X] ?
#    ? Security Schema completed
# 
# ?? Processing Password Reset Schema...
#    Found X SQL statements
#    [X/X] ?
#    ? Password Reset Schema completed
# 
# ? All migrations completed successfully!
```

### Verify Tables Created:

```sql
mysql -u hotel_user -p hotelDB

-- List all tables
SHOW TABLES;

-- Should show:
-- +------------------------+
-- | Tables_in_hotelDB      |
-- +------------------------+
-- | bookings               |
-- | daily_pricing          |
-- | email_logs             |
-- | firetv_command_logs    |
-- | firetv_devices         |
-- | login_attempts         |
-- | password_history       |
-- | password_reset_tokens  |
-- | payments               |
-- | pms_sync_log           |
-- | refresh_tokens         |
-- | rooms                  |
-- | two_factor_auth        |
-- | user_sessions          |
-- | users                  |
-- +------------------------+

-- Check a table structure
DESCRIBE users;

EXIT;
```

---

## ?? STEP 5: UPDATE ROUTE FILES (4-6 hours)

You need to update 60+ queries across 12 route files. Use the `MYSQL_QUERY_CONVERSION_GUIDE.md` for patterns.

### Files to Update (in priority order):

| File | Queries | Priority |
|------|---------|----------|
| `src/routes/auth.ts` | 21 | HIGH |
| `src/routes/bookings.ts` | 7 | HIGH |
| `src/routes/twoFactor.ts` | 7 | MEDIUM |
| `src/routes/devices.ts` | 6 | MEDIUM |
| `src/routes/adminReports.ts` | 6 | MEDIUM |
| `src/routes/payments.ts` | 5 | MEDIUM |
| `src/routes/sessions.ts` | 3 | LOW |
| `src/routes/availability.ts` | 2 | LOW |
| `src/routes/users.ts` | 2 | LOW |
| `src/routes/guestBookings.ts` | 1 | LOW |

### Key Conversion Pattern:

**BEFORE (PostgreSQL):**
```typescript
const result = await pool.query(
  'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
  [email, hash]
)
const user = result.rows[0]
```

**AFTER (MySQL):**
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

### Automated Find & Replace (use with caution):

1. **Parameter placeholders:** `$1` ? `?`, `$2` ? `?`, etc. (manual)
2. **Result destructuring:** `const result = await pool.query` ? `const [rows] = await pool.query`
3. **Row access:** `result.rows` ? `rows`
4. **Row count:** `result.rowCount` ? `rows.length`

?? **IMPORTANT:** Test each file after conversion!

---

## ?? STEP 6: TEST EVERYTHING (4-6 hours)

### Test Database Connection:
```bash
cd backend
npm run dev

# Should see:
# Server running on port 5000
# ? Database connected successfully
```

### Test Each Route:

```bash
# Use Postman, curl, or your frontend

# Test user registration
POST http://localhost:5000/api/auth/register
{
  "email": "test@example.com",
  "password": "Test123!",
  "firstName": "Test",
  "lastName": "User"
}

# Test login
POST http://localhost:5000/api/auth/login
{
  "email": "test@example.com",
  "password": "Test123!"
}

# Test booking creation
POST http://localhost:5000/api/bookings
{
  "room_id": "<uuid>",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "check_in_date": "2024-02-01",
  "check_out_date": "2024-02-03",
  "guest_count": 2,
  "subtotal": 200.00
}

# Test admin endpoints (with auth token)
GET http://localhost:5000/api/admin/stats
Authorization: Bearer <token>
```

### Run Tests:
```bash
npm test
```

---

## ?? STEP 7: DEPLOY TO PRODUCTION (30-60 min)

### Pre-Deployment Checklist:
- [ ] All route files updated
- [ ] All tests passing
- [ ] MySQL database created in production
- [ ] Environment variables updated
- [ ] Migration tested on staging
- [ ] Rollback plan ready
- [ ] Team notified of maintenance window

### Deployment Steps:

1. **Announce Maintenance**
   - 30-60 minute window
   - Schedule during low-traffic period

2. **Backup Current PostgreSQL Database**
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Stop Application**
   ```bash
   # Stop your Node.js process
   pm2 stop all
   # or
   systemctl stop scottish-inn
   ```

4. **Update Environment Variables**
   ```bash
   # Update production .env
   DATABASE_URL=mysql://hotel_user:password@mysql-host:3306/hotelDB
   ```

5. **Deploy New Code**
   ```bash
   git pull origin master
   cd backend
   npm install
   npm run build
   ```

6. **Run Migrations**
   ```bash
   npm run migrate
   ```

7. **Start Application**
   ```bash
   pm2 start dist/index.js
   # or
   systemctl start scottish-inn
   ```

8. **Verify Health**
   ```bash
   curl http://your-domain.com/health
   # Should return 200 OK
   ```

9. **Test Critical Flows**
   - User registration
   - User login
   - Create booking
   - Payment processing
   - Admin dashboard

10. **Monitor Logs**
    ```bash
    pm2 logs
    # or
    tail -f /var/log/scottish-inn/app.log
    ```

---

## ?? ROLLBACK PLAN (if needed)

If migration fails:

1. **Stop Application**
   ```bash
   pm2 stop all
   ```

2. **Revert Environment Variables**
   ```bash
   # Change DATABASE_URL back to PostgreSQL
   DATABASE_URL=postgresql://hotel_user:password@localhost:5433/hotelDB
   ```

3. **Deploy Previous Code**
   ```bash
   git checkout <previous-commit>
   cd backend
   npm install
   npm run build
   ```

4. **Start Application**
   ```bash
   pm2 start dist/index.js
   ```

5. **Verify Functionality**
   ```bash
   curl http://your-domain.com/health
   ```

**Rollback Time:** 5-10 minutes

---

## ?? VERIFICATION CHECKLIST

### Database Level:
- [ ] All 15 tables created
- [ ] All indexes created
- [ ] All foreign keys working
- [ ] Character set is utf8mb4
- [ ] Collation is utf8mb4_unicode_ci

### Application Level:
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] All routes respond
- [ ] UUID generation working
- [ ] JSON fields working
- [ ] Timestamps correct

### Functionality Level:
- [ ] User registration works
- [ ] User login works
- [ ] Booking creation works
- [ ] Payment processing works
- [ ] Email sending works
- [ ] Admin dashboard loads
- [ ] FireTV controls work
- [ ] Reports generate correctly

---

## ?? CURRENT STATUS

### ? Completed:
1. MySQL schema files created
2. Database connection updated (db.ts)
3. Migration script updated (migrate.ts)
4. Documentation created

### ? Remaining:
1. Update 60+ queries in route files (4-6 hours)
2. Test all endpoints (4-6 hours)
3. Deploy to production (30-60 min)

---

## ?? NEXT IMMEDIATE STEPS

### RIGHT NOW:

1. **Install MySQL:**
   ```bash
   # Choose your method (local/Docker)
   # See Step 2 above
   ```

2. **Update package.json:**
   ```bash
   cd backend
   npm uninstall pg @types/pg
   npm install mysql2
   ```

3. **Update .env:**
   ```bash
   # Edit backend/.env
   DATABASE_URL=mysql://hotel_user:180496@localhost:3306/hotelDB
   ```

4. **Run migrations:**
   ```bash
   npm run migrate
   ```

5. **Start updating route files:**
   - Begin with `auth.ts` (highest priority)
   - Use `MYSQL_QUERY_CONVERSION_GUIDE.md`
   - Test each file as you go

---

## ? TROUBLESHOOTING

### Error: "Cannot find module 'mysql2'"
```bash
npm install mysql2
```

### Error: "Access denied for user"
```sql
-- Re-create user with permissions
DROP USER 'hotel_user'@'localhost';
CREATE USER 'hotel_user'@'localhost' IDENTIFIED BY '180496';
GRANT ALL PRIVILEGES ON hotelDB.* TO 'hotel_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Table already exists"
```sql
-- Drop and recreate database
DROP DATABASE hotelDB;
CREATE DATABASE hotelDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Connection timeout"
```bash
# Check MySQL is running
sudo systemctl status mysql
# or
brew services list | grep mysql
```

---

## ?? NEED HELP?

If you encounter issues:

1. **Check the logs:**
   ```bash
   # Application logs
   npm run dev
   
   # MySQL logs
   sudo tail -f /var/log/mysql/error.log
   ```

2. **Verify MySQL connection:**
   ```bash
   mysql -u hotel_user -p hotelDB
   ```

3. **Test a simple query:**
   ```typescript
   const [rows] = await pool.query('SELECT 1 AS test')
   console.log(rows) // Should log: [{ test: 1 }]
   ```

---

## ? SUCCESS CRITERIA

Migration is successful when:
- ? All tables created in MySQL
- ? npm run dev starts without errors
- ? User can register and login
- ? Bookings can be created
- ? Payments process correctly
- ? All tests pass
- ? No console errors in production

---

**You now have everything you need to complete the MySQL migration!**

Start with Step 1 (updating dependencies) and work through each step systematically. Test thoroughly before deploying to production.

Good luck! ??
