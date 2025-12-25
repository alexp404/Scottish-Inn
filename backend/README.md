# Hotel Management Backend

Quick start:

1. cd backend
2. npm install

Run migrations:

```bash
# ensure DATABASE_URL is set in .env
npm run migrate

# Apply auth and security schemas
psql -U hotel_user -d hotelDB -f database/password-reset-schema.sql
psql -U hotel_user -d hotelDB -f database/security-schema.sql
```

Seed default admin user:

```bash
# creates admin user from ADMIN_USER/ADMIN_PASS in .env
npm run seed-admin
```

Start dev server:

```bash
npm run dev
```

## Available Endpoints

### Authentication
- **POST /api/auth/login** - Login with username/password (rate limited: 5 attempts per 15 min)
- **POST /api/auth/refresh** - Refresh access token
- **POST /api/auth/logout** - Logout and invalidate session
- **POST /api/auth/register-admin** - Register admin user
- **POST /api/auth/forgot-password** - Request password reset (rate limited: 3 per hour)
- **POST /api/auth/reset-password** - Reset password with token

### Two-Factor Authentication (requires auth)
- **POST /api/2fa/setup** - Generate 2FA secret and QR code
- **POST /api/2fa/verify** - Verify and enable 2FA
- **POST /api/2fa/disable** - Disable 2FA (requires password)
- **GET /api/2fa/status** - Get 2FA status

### Session Management (requires auth)
- **GET /api/sessions** - List active sessions
- **DELETE /api/sessions/:sessionId** - Revoke specific session
- **POST /api/sessions/revoke-all** - Revoke all sessions except current

### Other Endpoints
- Fire TV, Rooms, Bookings (as documented previously)

## Security Features

### 1. Email Integration
- Password reset emails via Sendgrid/SMTP
- 2FA setup notifications
- Login notifications for new devices
- Configure in `.env`: `SENDGRID_API_KEY` or `SMTP_*` vars

### 2. Rate Limiting
- Login attempts: 5 per 15 minutes per email/IP
- Password reset: 3 per hour per email/IP
- General auth endpoints: 10 per minute per IP
- Returns `429 Too Many Requests` with `Retry-After` header

### 3. Account Lockout
- Locks account after 5 failed login attempts
- Lockout duration: 15 minutes
- Tracks failed attempts in `login_attempts` table

### 4. Two-Factor Authentication
- TOTP-based (compatible with Google Authenticator, Authy)
- QR code generation for easy setup
- 10 backup codes generated
- Optional verification on login

### 5. Session Management
- All active sessions tracked in `user_sessions` table
- View all devices/IPs currently logged in
- Revoke individual sessions or all except current
- Sessions auto-expire based on refresh token lifetime

### 6. Password History
- Prevents reuse of last 5 passwords
- Stored in `password_history` table
- Checked on password reset and registration
- Uses bcrypt comparison (secure)

## Password Requirements

- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character
- Cannot reuse last 5 passwords

## Setup Instructions

1. **Configure Email** (required for password reset):
   - Set `SENDGRID_API_KEY` in `.env`, OR
   - Configure SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)

2. **Run Migrations**:
   ```bash
   npm run migrate
   psql -U hotel_user -d hotelDB -f database/password-reset-schema.sql
   psql -U hotel_user -d hotelDB -f database/security-schema.sql
   ```

3. **Seed Admin User**:
   ```bash
   npm run seed-admin
   ```

4. **Start Server**:
   ```bash
   npm run dev
   ```

## Testing Security Features

### Test Account Lockout
1. Try logging in with wrong password 5 times
2. Account locked for 15 minutes
3. Error message shows lockout duration

### Test Password Reset with Email
1. Request reset at `/api/auth/forgot-password`
2. Check email for reset link (or console logs in dev)
3. Visit reset link, set new password
4. All sessions invalidated

### Test 2FA
1. Login and visit `/admin/2fa/setup`
2. Scan QR code with authenticator app
3. Enter 6-digit code to enable
4. Next login will require 2FA code

### Test Session Management
1. Login from multiple devices/browsers
2. Visit `/admin/sessions`
3. See all active sessions with IP/device info
4. Revoke individual sessions or all

## Production Considerations

- ? Use real email service (Sendgrid recommended)
- ? Use strong `JWT_SECRET` (32+ random chars)
- ? Enable HTTPS for all endpoints
- ? Configure CORS properly
- ? Set up log monitoring for failed login attempts
- ? Consider adding CAPTCHA for login after N attempts
- ? Rotate refresh tokens periodically
- ? Monitor session table size, cleanup expired
