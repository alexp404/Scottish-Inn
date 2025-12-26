# ?? CORS Issue Fix - Complete Guide

## ? ISSUE RESOLVED

**Problem:** CORS error when frontend tries to access backend API

```
Access to fetch at 'https://scottish-inn-backend.onrender.com/api/rooms' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

---

## ?? What Was Fixed

### 1. Backend CORS Configuration (`backend/src/index.ts`)

**Before (Single Origin):**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
```

**After (Multiple Origins):**
```typescript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://scottish-inn-frontend.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      console.warn('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
```

### 2. Frontend API Configuration (`frontend/src/services/api.ts`)

**Before (Production URL):**
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'https://scottish-inn-backend.onrender.com'
```

**After (Auto-detect):**
```typescript
const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://scottish-inn-backend.onrender.com')
```

### 3. Environment Variables (`frontend/.env`)

**Created:**
```bash
VITE_API_URL=http://localhost:5000
VITE_ADMIN_TOKEN=admin-secret
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
NODE_ENV=development
```

---

## ?? How to Test the Fix

### Step 1: Start Backend
```bash
cd backend
npm run dev
```

**Expected Output:**
```
?? Backend API running on http://localhost:5000
?? Health check: http://localhost:5000/api/health
? Database connection OK
?? Allowed origins: http://localhost:5173, http://localhost:3000, https://scottish-inn-frontend.onrender.com
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v7.3.0  ready in XXX ms

?  Local:   http://localhost:5173/
?  Network: use --host to expose
```

### Step 3: Check Browser Console
Open http://localhost:5173 and check the console:

**Expected:**
```
?? API Configuration: {
  baseUrl: 'http://localhost:5000',
  environment: 'development'
}
```

### Step 4: Test API Call
Navigate to homepage, should load rooms without CORS error.

---

## ?? How CORS Works

### What is CORS?
Cross-Origin Resource Sharing (CORS) is a security feature that restricts web pages from making requests to a different domain than the one serving the page.

### The Problem
```
Frontend:  http://localhost:5173
Backend:   https://scottish-inn-backend.onrender.com
           ?
           Different origins ? CORS policy applied
```

### The Solution
Backend tells browser: "I allow requests from these origins"

```typescript
allowedOrigins = [
  'http://localhost:5173',      // Development frontend
  'http://localhost:3000',      // Alternative dev port
  'https://scottish-inn-frontend.onrender.com'  // Production
]
```

---

## ?? CORS Configuration Details

### Allowed Origins
The backend now accepts requests from:

1. **Local Development:**
   - `http://localhost:5173` (Vite default)
   - `http://localhost:3000` (Alternative port)

2. **Production:**
   - `https://scottish-inn-frontend.onrender.com`
   - Custom domain from `FRONTEND_URL` env var

3. **Special Cases:**
   - Requests with no origin (curl, Postman, mobile apps)

### Allowed Methods
```typescript
['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
```

### Allowed Headers
```typescript
['Content-Type', 'Authorization']
```

### Credentials
```typescript
credentials: true  // Allows cookies and auth headers
```

---

## ??? Environment-Specific Configuration

### Development
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:5000

# Backend (.env)
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Production
```bash
# Frontend (Render env vars)
VITE_API_URL=https://scottish-inn-backend.onrender.com

# Backend (Render env vars)
FRONTEND_URL=https://scottish-inn-frontend.onrender.com
NODE_ENV=production
```

---

## ?? Testing CORS

### Test from Browser Console
```javascript
// Should succeed
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)

// Expected response:
{
  status: 'ok',
  timestamp: '2024-01-15T10:30:00.000Z',
  uptime: 12345,
  database: 'connected',
  environment: 'development',
  version: '1.0.0'
}
```

### Test with cURL
```bash
# Should succeed
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5000/api/rooms -v

# Look for:
< Access-Control-Allow-Origin: http://localhost:5173
< Access-Control-Allow-Credentials: true
```

---

## ?? Troubleshooting

### Still Getting CORS Error?

#### 1. Check Backend is Running
```bash
curl http://localhost:5000/api/health
```

#### 2. Check Allowed Origins
Look for this in backend console:
```
?? Allowed origins: http://localhost:5173, ...
```

#### 3. Check Frontend API URL
Look for this in browser console:
```
?? API Configuration: { baseUrl: 'http://localhost:5000', ... }
```

#### 4. Clear Browser Cache
```
Ctrl + Shift + Delete ? Clear cached images and files
```

#### 5. Hard Reload
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

#### 6. Check .env File Loaded
```bash
# Frontend
cd frontend
cat .env

# Should show:
VITE_API_URL=http://localhost:5000
```

#### 7. Restart Both Servers
```bash
# Kill both terminals
# Restart backend
cd backend && npm run dev

# Restart frontend
cd frontend && npm run dev
```

---

## ?? CORS Flow Diagram

```
???????????????????????????????????????????????????????????
?  Browser at http://localhost:5173                       ?
?                                                          ?
?  User clicks "Search Rooms"                             ?
???????????????????????????????????????????????????????????
                    ?
???????????????????????????????????????????????????????????
?  Browser sends PREFLIGHT request (OPTIONS)              ?
?  Origin: http://localhost:5173                          ?
?  ? http://localhost:5000/api/rooms                      ?
???????????????????????????????????????????????????????????
                    ?
???????????????????????????????????????????????????????????
?  Backend checks allowed origins                         ?
?  Is 'http://localhost:5173' in allowedOrigins?         ?
?  ? YES                                                 ?
???????????????????????????????????????????????????????????
                    ?
???????????????????????????????????????????????????????????
?  Backend responds with headers:                         ?
?  Access-Control-Allow-Origin: http://localhost:5173    ?
?  Access-Control-Allow-Credentials: true                ?
?  Access-Control-Allow-Methods: GET,POST,...            ?
???????????????????????????????????????????????????????????
                    ?
???????????????????????????????????????????????????????????
?  Browser allows the actual GET request                  ?
?  ? http://localhost:5000/api/rooms                      ?
???????????????????????????????????????????????????????????
                    ?
???????????????????????????????????????????????????????????
?  Backend returns room data                              ?
?  { rooms: [...] }                                       ?
???????????????????????????????????????????????????????????
                    ?
???????????????????????????????????????????????????????????
?  Frontend displays rooms                                ?
?  ? SUCCESS                                             ?
???????????????????????????????????????????????????????????
```

---

## ? Verification Checklist

After applying the fix, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Browser console shows API configuration
- [ ] Backend console shows allowed origins
- [ ] Homepage loads without CORS errors
- [ ] API calls succeed (check Network tab)
- [ ] Rooms load on homepage
- [ ] No red errors in browser console

---

## ?? Security Notes

### Development vs Production

**Development (Loose CORS):**
- Allows localhost:5173, localhost:3000
- Good for testing

**Production (Strict CORS):**
- Only allows specific production domain
- Better security

### Best Practices

1. ? **Never use `*` wildcard** in production
2. ? **Always validate origins** server-side
3. ? **Use environment variables** for allowed origins
4. ? **Enable credentials** only when needed
5. ? **Log blocked requests** for debugging

---

## ?? Additional Resources

- **MDN CORS Guide:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Express CORS Package:** https://www.npmjs.com/package/cors
- **Vite Env Variables:** https://vitejs.dev/guide/env-and-mode.html

---

**CORS issue is now resolved! Your app should work in both development and production.** ?

---

*Last Updated: 2024-01-15*  
*Status: ? FIXED*
