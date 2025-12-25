# Manual Testing Guide - Signup Feature

## Prerequisites
1. Backend server running on http://localhost:5000
2. Frontend dev server running on http://localhost:5173
3. PostgreSQL database running with `hotelDB` database

---

## Test Case 1: Successful Signup ?

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Fill in the form:
   - **First Name:** John
   - **Last Name:** Doe
   - **Email:** john.doe@example.com
   - **Password:** SecurePass123!
   - **Confirm Password:** SecurePass123!
3. Observe password strength indicator (should show "Strong" in green)
4. Click "Sign Up" button

### Expected Results:
- ? Button shows "Creating Account..." with disabled state
- ? Success toast appears: "Welcome John! Your account has been created. Please log in."
- ? Automatic redirect to `/admin/login` after 1.5 seconds
- ? Email field pre-filled with "john.doe@example.com" on login page

### Verify in Database:
```sql
SELECT id, email, first_name, last_name, is_verified, is_active, is_staff, is_admin, created_at
FROM users 
WHERE email = 'john.doe@example.com';
```

**Expected:**
- Email: john.doe@example.com
- First Name: John
- Last Name: Doe
- is_verified: true
- is_active: true
- is_staff: false
- is_admin: false
- password_hash: (bcrypt hash starting with $2b$10$)

---

## Test Case 2: Duplicate Email ?

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Fill in the form with the same email from Test Case 1:
   - **First Name:** Jane
   - **Last Name:** Smith
   - **Email:** john.doe@example.com (same as before)
   - **Password:** AnotherPass456!
   - **Confirm Password:** AnotherPass456!
3. Click "Sign Up"

### Expected Results:
- ? Error toast: "Email already registered. Please use a different email or log in."
- ? Red error message under email field: "An account with this email already exists"
- ? Form remains filled (not cleared)
- ? User can correct email and retry

---

## Test Case 3: Weak Password ?

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Fill in the form:
   - **First Name:** Test
   - **Last Name:** User
   - **Email:** test.user@example.com
   - **Password:** weak
   - **Confirm Password:** weak
3. Observe password strength indicator (should show "Weak" in red)
4. Click "Sign Up"

### Expected Results:
- ? Error toast: "Please fix the errors below"
- ? Red error message under password field with specific requirement
- ? Password strength indicator shows red bar at 33%
- ? Requirements list shows what's missing

---

## Test Case 4: Password Mismatch ?

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Fill in the form:
   - **First Name:** Test
   - **Last Name:** User
   - **Email:** test.user@example.com
   - **Password:** SecurePass123!
   - **Confirm Password:** SecurePass456! (different)
3. Click "Sign Up"

### Expected Results:
- ? Error toast: "Please fix the errors below"
- ? Red error message under confirm password: "Passwords do not match"
- ? Form validation prevents submission

---

## Test Case 5: Missing Required Fields ?

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Leave First Name empty
3. Fill in other fields:
   - **Last Name:** Doe
   - **Email:** test@example.com
   - **Password:** SecurePass123!
   - **Confirm Password:** SecurePass123!
4. Click "Sign Up"

### Expected Results:
- ? Error toast: "Please fix the errors below"
- ? Red error under First Name: "First name is required"
- ? Form validation prevents submission

---

## Test Case 6: Invalid Email Format ?

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Fill in the form:
   - **First Name:** Test
   - **Last Name:** User
   - **Email:** invalid-email (no @ or domain)
   - **Password:** SecurePass123!
   - **Confirm Password:** SecurePass123!
3. Click "Sign Up"

### Expected Results:
- ? Error toast: "Please fix the errors below"
- ? Red error under email: "Please enter a valid email address"
- ? HTML5 email validation also triggers

---

## Test Case 7: Show/Hide Password Toggle ???

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Type in password field: "SecurePass123!"
3. Click the eye icon button
4. Observe password becomes visible as plain text
5. Click again to hide

### Expected Results:
- ? Password toggles between hidden (••••) and visible (SecurePass123!)
- ? Confirm password field visibility matches
- ? Eye icon changes appearance

---

## Test Case 8: Password Strength Indicator

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Type progressively stronger passwords:
   - "a" ? Weak (red)
   - "password" ? Weak (red)
   - "Password1" ? Medium (orange)
   - "Password123!" ? Strong (green)

### Expected Results:
- ? Progress bar grows and changes color
- ? Label shows: Weak / Medium / Strong
- ? Requirements list updates in real-time
- ? Requirements checked off as met

---

## Test Case 9: Cancel Button

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Fill in some fields
3. Click "Cancel" button

### Expected Results:
- ? Immediate redirect to `/admin/login`
- ? No data saved
- ? No confirmation dialog (instant cancel)

---

## Test Case 10: Network Error Handling ??

### Steps:
1. Stop the backend server
2. Navigate to `http://localhost:5173/signup`
3. Fill in valid data
4. Click "Sign Up"

### Expected Results:
- ? Error toast: "Registration failed. Please try again."
- ? Form remains filled
- ? User can retry when backend is restored

---

## Test Case 11: Real-time Field Error Clearing ?

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Click "Sign Up" with empty form (trigger all errors)
3. Start typing in First Name field

### Expected Results:
- ? Error under First Name clears immediately when typing starts
- ? Other field errors remain until addressed
- ? Toast error remains visible

---

## Test Case 12: Keyboard Navigation ??

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Use Tab key to navigate through fields
3. Use Shift+Tab to go backwards
4. Use Enter key in last field to submit

### Expected Results:
- ? All fields receive focus in logical order
- ? Focus rings visible (gold outline)
- ? Form submits on Enter key
- ? Fully keyboard accessible

---

## Test Case 13: Responsive Design ??

### Steps:
1. Navigate to `http://localhost:5173/signup`
2. Resize browser to mobile width (<640px)
3. Test all form interactions

### Expected Results:
- ? Name fields stack vertically on mobile
- ? Card width adjusts to screen
- ? Buttons remain accessible
- ? Text remains readable
- ? Touch targets are adequate size

---

## Database Verification Queries

### Check all registered users:
```sql
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  is_verified, 
  is_active,
  created_at
FROM users 
ORDER BY created_at DESC;
```

### Verify password hashing:
```sql
SELECT 
  email, 
  password_hash,
  LENGTH(password_hash) as hash_length
FROM users 
WHERE email = 'john.doe@example.com';
```
Expected hash_length: 60 (bcrypt format)

### Count total users:
```sql
SELECT COUNT(*) as total_users FROM users;
```

### Check for duplicate emails (should return 0):
```sql
SELECT email, COUNT(*) 
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;
```

---

## Backend API Testing (cURL)

### Successful Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl.test@example.com",
    "password": "CurlTest123!",
    "firstName": "Curl",
    "lastName": "Test"
  }'
```

**Expected Response (201):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "curl.test@example.com",
    "first_name": "Curl",
    "last_name": "Test"
  }
}
```

### Duplicate Email:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl.test@example.com",
    "password": "AnotherPass123!",
    "firstName": "Another",
    "lastName": "User"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Email already exists"
}
```

### Weak Password:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak.password@example.com",
    "password": "weak",
    "firstName": "Weak",
    "lastName": "Password"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Password does not meet requirements",
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter",
    "Password must contain at least one number",
    "Password must contain at least one special character"
  ]
}
```

---

## Browser Console Debugging

### Check for successful registration:
Open browser DevTools ? Console tab

**On Success:**
```javascript
User registered successfully: {
  user: {
    id: "uuid",
    email: "john.doe@example.com",
    first_name: "John",
    last_name: "Doe"
  }
}
```

**On Error:**
```javascript
Registration error: Error {
  message: "Email already exists",
  status: 400,
  body: { error: "Email already exists" }
}
```

---

## Performance Checks

1. **Page Load Time:** < 2 seconds
2. **Form Submit Response:** < 500ms (local)
3. **Password Hash Time:** < 200ms
4. **Database Insert:** < 100ms

---

## Cleanup After Testing

### Delete test users:
```sql
DELETE FROM users 
WHERE email IN (
  'john.doe@example.com',
  'jane.smith@example.com',
  'test.user@example.com',
  'curl.test@example.com'
);
```

### Verify cleanup:
```sql
SELECT COUNT(*) FROM users;
```

---

## ? All Tests Passed Checklist

- [ ] Successful signup creates user in database
- [ ] Duplicate email is rejected
- [ ] Weak password is rejected
- [ ] Password mismatch is caught
- [ ] Missing fields are validated
- [ ] Invalid email format is rejected
- [ ] Password visibility toggle works
- [ ] Password strength indicator updates
- [ ] Cancel button redirects properly
- [ ] Network errors handled gracefully
- [ ] Field errors clear on typing
- [ ] Keyboard navigation works
- [ ] Responsive design functions on mobile
- [ ] Database stores hashed passwords
- [ ] Success toast and redirect work

---

**If all tests pass, the signup integration is production-ready! ??**
