# PostgreSQL to MySQL Migration - Quick Reference

## ? Quick Summary

**What:** Migrate Scottish Inn hotel management system from PostgreSQL to MySQL  
**Scope:** 11 tables, 60+ SQL queries across 12 route files  
**Time:** 15-23 hours  
**Risk:** MEDIUM-HIGH (breaking changes required)  
**Downtime:** 30-60 minutes  

---

## ?? CRITICAL: DECISIONS NEEDED BEFORE STARTING

### 1. JSONB ? JSON Strategy
**Question:** How to handle JSON columns?
- **Option A:** MySQL JSON type ? RECOMMENDED
- **Option B:** TEXT with JSON validation
- **Option C:** Normalize to separate tables

### 2. Date/Time Fields
**Question:** DATETIME or TIMESTAMP?
- **Option A:** DATETIME ? RECOMMENDED (no 2038 limit)
- **Option B:** TIMESTAMP (MySQL standard, but limited to 2038)

### 3. UUID Generation
**Question:** Where to generate UUIDs?
- **Option A:** MySQL UUID() function
- **Option B:** Node.js uuidv4() ? RECOMMENDED (consistency)

### 4. Data Migration
**Question:** Start fresh or migrate data?
- **Option A:** New database (no data migration)
- **Option B:** Migrate existing PostgreSQL data ? IF YOU HAVE PRODUCTION DATA

### 5. Timing
**Question:** When to migrate?
- **Option A:** This week (if urgent)
- **Option B:** Staged over 2-3 weeks ? RECOMMENDED

---

## ?? Key Changes Required

| PostgreSQL Feature | MySQL Equivalent | Impact |
|-------------------|------------------|---------|
| UUID type | CHAR(36) | All 11 tables |
| gen_random_uuid() | UUID() or uuidv4() | All primary keys |
| JSONB | JSON | 6 columns |
| $1, $2 placeholders | ?, ? | 60+ queries |
| result.rows | [rows, fields] | All queries |
| RETURNING clause | Generate UUID first | INSERT queries |
| pgcrypto extension | Remove | No longer needed |

---

## ?? Files to Modify

### Configuration (2 files):
- `backend/src/utils/db.ts` - Switch to mysql2
- `backend/.env` - Update connection string

### Schema (3 files):
- `backend/src/database/schema-mysql.sql` - NEW
- `backend/src/database/security-schema-mysql.sql` - NEW  
- `backend/src/utils/migrate.ts` - Update for MySQL

### Routes (12 files with 60+ queries):
1. `auth.ts` - 21 queries
2. `twoFactor.ts` - 7 queries
3. `bookings.ts` - 7 queries
4. `devices.ts` - 6 queries
5. `adminReports.ts` - 6 queries
6. `payments.ts` - 5 queries
7. `sessions.ts` - 3 queries
8. `availability.ts` - 2 queries
9. `users.ts` - 2 queries
10. `guestBookings.ts` - 1 query
11. `firetv.ts` - Review
12. `rooms.ts` - Review

---

## ?? Time Estimates

| Phase | Duration | Description |
|-------|----------|-------------|
| Planning | 2-3 hours | Review, decisions, setup |
| Schema Conversion | 3-4 hours | Convert SQL files |
| Code Updates | 4-6 hours | Update 60+ queries |
| Testing | 4-6 hours | Full test suite |
| Data Migration | 2-4 hours | If migrating existing data |
| Deployment | 0.5-1 hour | Production rollout |
| **TOTAL** | **15-23 hours** | Full migration |

---

## ? Migration Checklist

### Pre-Migration
- [ ] Answer 5 decision points
- [ ] Get stakeholder approval
- [ ] Backup PostgreSQL database
- [ ] Install MySQL 8.0+
- [ ] Create Git branch
- [ ] Schedule maintenance window

### Migration
- [ ] Install mysql2 package
- [ ] Create MySQL schemas
- [ ] Update db.ts connection
- [ ] Update all 60+ queries
- [ ] Update migrate.ts script
- [ ] Run migrations
- [ ] Import data (if applicable)

### Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] All routes working
- [ ] Performance acceptable
- [ ] No data loss

### Deployment
- [ ] Deploy to staging
- [ ] Smoke test
- [ ] Deploy to production
- [ ] Monitor for 1 hour
- [ ] Update documentation

---

## ?? Breaking Changes

### UUID Format
- **Before:** PostgreSQL UUID type
- **After:** CHAR(36)
- **Impact:** All tables, all foreign keys
- **Risk:** LOW (UUID string format unchanged)

### Query Return Format
- **Before:** `result.rows[0]`
- **After:** `const [rows] = await query(...); rows[0]`
- **Impact:** Every query in codebase
- **Risk:** MEDIUM (easy to miss one)

### INSERT RETURNING
- **Before:** `INSERT ... RETURNING *`
- **After:** Generate UUID first, then SELECT
- **Impact:** ~10 INSERT queries
- **Risk:** MEDIUM (need to change pattern)

---

## ?? Success Criteria

? All tables created  
? All constraints working  
? All 60+ queries functional  
? All tests passing  
? No data loss  
? Downtime < 60 minutes  
? Rollback plan ready  

---

## ?? Rollback Plan

If migration fails:
1. Stop application
2. Revert to PostgreSQL connection
3. Deploy previous code version
4. Restart application
5. Verify functionality

**Rollback time:** 5-10 minutes

---

## ?? Recommendations

### Before You Start:
1. **Question the need** - PostgreSQL is excellent for this app. Why migrate?
2. **Test on staging** - Full migration run before production
3. **Practice rollback** - Ensure it works before go-live
4. **Monitor closely** - Watch logs for 24 hours after migration

### During Migration:
1. **Go slow** - Don't rush, check each step
2. **Test thoroughly** - Every route, every feature
3. **Document issues** - Track problems for future reference
4. **Have help available** - Don't migrate alone

### After Migration:
1. **Monitor performance** - Compare to PostgreSQL baseline
2. **Keep backups** - PostgreSQL backup for 30 days
3. **Update docs** - Reflect MySQL in all documentation
4. **Train team** - Ensure everyone knows MySQL differences

---

## ? Next Steps

### Option 1: Proceed with Migration
1. Answer the 5 decision points
2. I'll generate complete MySQL schemas
3. I'll update all route files with MySQL queries
4. You test on staging
5. Deploy to production

### Option 2: Defer Migration
- Keep using PostgreSQL (recommended if no compelling reason)
- Revisit when there's a clear business need
- Focus on other optimizations instead

### Option 3: Partial Migration
- Migrate only development environment
- Keep production on PostgreSQL
- Evaluate performance before full migration

---

## ?? Contact for Help

**Questions?** Please answer these:

1. Why do you want to migrate to MySQL?
2. Do you have existing production data to migrate?
3. What's your preferred timeline?
4. Which options do you choose for the 5 decision points?

**Then I'll:**
- Generate complete MySQL schema
- Update all 60+ queries
- Create migration scripts
- Provide step-by-step guide

---

**Ready to proceed? Answer the decision points above!** ??
