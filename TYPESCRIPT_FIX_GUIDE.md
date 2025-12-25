# TypeScript Error Fix Guide

## Problem
You're getting this TypeScript error:
```
src/__tests__/availability.test.ts(1,21): error TS7016: Could not find a declaration file for module 'supertest'
```

## ? **SOLUTION - Quick Fix**

Run this command to automatically fix all TypeScript issues:

```bash
npm run fix:typescript
```

## Manual Fix Steps

If the automatic fix doesn't work, follow these steps:

### 1. Install Missing Type Definitions
```bash
cd backend
npm install --save-dev @types/supertest@^6.0.2 @types/ws@^8.5.10
```

### 2. Clear TypeScript Cache
```bash
cd backend
npx tsc --build --clean
rm -rf node_modules/.cache  # Linux/Mac
rmdir /s /q node_modules\.cache  # Windows
```

### 3. Verify TypeScript Compilation
```bash
cd backend
npx tsc --noEmit
```

### 4. Run Tests
```bash
cd backend
npm test
```

## What Was Fixed

### ? **Backend package.json Updates:**
- Added `@types/supertest@^6.0.2` for test type definitions
- Added `@types/ws@^8.5.10` for WebSocket type definitions  
- Added FireTV server scripts (`dev:firetv`, `simulate:devices`)

### ? **TypeScript Configuration Updates:**
- **tsconfig.json** - Better module resolution and type handling
- **tsconfig.test.json** - Test-specific TypeScript configuration
- **jest.config.js** - Updated to use test TypeScript config

### ? **New Scripts Added:**
- `npm run fix:typescript` - Automatically fix TypeScript issues
- `npm run dev:firetv` - Start FireTV WebSocket server
- `npm run simulate:devices` - Simulate FireTV devices for testing

## Common TypeScript Errors & Fixes

### Error: "Cannot find declaration file for module 'X'"
**Fix:** Install the corresponding `@types/X` package
```bash
npm install --save-dev @types/package-name
```

### Error: "Module resolution error"
**Fix:** Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "TypeScript compilation failed"
**Fix:** Check tsconfig.json settings
```bash
npx tsc --noEmit --listFiles  # See what files are being processed
```

## File Structure
```
backend/
??? package.json          # ? Updated with missing types
??? tsconfig.json          # ? Improved configuration  
??? tsconfig.test.json     # ? Test-specific config
??? jest.config.js         # ? Updated for better TS support
??? src/
    ??? __tests__/         # Test files
    ??? server/            # FireTV WebSocket server
    ??? ...                # Rest of your backend code
```

## Verification

After running the fix, you should see:
- ? No TypeScript compilation errors
- ? Tests pass without type errors  
- ? FireTV server can be started
- ? WebSocket types are available

## Development Workflow

**For regular development:**
```bash
npm run dev  # Starts backend + frontend
```

**For FireTV development:**
```bash
npm run dev:firetv        # Start FireTV WebSocket server
npm run simulate:devices  # Simulate devices (separate terminal)
```

**For testing:**
```bash
npm run test:backend  # Run backend tests
npm test              # Run all tests
```

---

**?? That's it!** Your TypeScript errors should be resolved and you can continue development.

If you still see errors, run `npm run fix:typescript` or check the individual steps above.