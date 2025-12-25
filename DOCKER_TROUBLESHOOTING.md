# Docker Troubleshooting Guide

## Common Issues and Solutions

### 1. "Docker Desktop is not running"

**Error:** `unable to get image: error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/...`

**Solutions:**
1. **Start Docker Desktop**
   - Windows: Search for "Docker Desktop" in Start menu
   - Mac: Open Docker from Applications folder
   - Linux: `sudo systemctl start docker`

2. **Wait for Docker to fully start**
   - Look for the whale icon in system tray (should be steady, not animated)
   - Try running `docker --version` in terminal

3. **Restart Docker Desktop**
   - Close Docker Desktop completely
   - Restart it and wait for full startup

### 2. "Version attribute is obsolete"

**Error:** `the attribute 'version' is obsolete`

**Solution:** ? **Fixed** - Removed `version` field from docker-compose.yml

### 3. Port Already in Use

**Error:** `Port 5000 is already allocated` or similar

**Solutions:**
1. **Check what's using the port:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Mac/Linux
   lsof -i :5000
   ```

2. **Stop conflicting services:**
   ```bash
   # Stop your development servers
   npm run dev:backend  # Ctrl+C to stop
   ```

3. **Change ports in docker-compose.yml:**
   ```yaml
   ports:
     - "5001:5000"  # Use 5001 instead of 5000
   ```

### 4. Build Failures

**Error:** `failed to build` or `COPY failed`

**Solutions:**
1. **Check Dockerfile paths:**
   - Ensure `frontend/Dockerfile` exists
   - Ensure `backend/Dockerfile` exists
   - Verify `package.json` files are present

2. **Clean Docker cache:**
   ```bash
   npm run docker:clean
   docker system prune -a
   ```

3. **Rebuild from scratch:**
   ```bash
   npm run docker:build
   ```

### 5. Database Connection Issues

**Error:** `ECONNREFUSED` or database errors

**Solutions:**
1. **Wait for database to start:**
   ```bash
   npm run docker:logs:db
   # Wait for "database system is ready to accept connections"
   ```

2. **Check database health:**
   ```bash
   npm run docker:shell:db
   # Should connect to PostgreSQL
   ```

3. **Reset database:**
   ```bash
   npm run docker:down
   docker volume rm reactproject3_db_data
   npm run docker:up
   ```

### 6. Frontend Build Issues

**Error:** Vite build failures or missing files

**Solutions:**
1. **Check frontend dependencies:**
   ```bash
   cd frontend
   npm install
   npm run build  # Test build locally
   ```

2. **Verify environment variables:**
   - Check `VITE_API_URL` in docker-compose.yml
   - Ensure all required env vars are set

### 7. Network Issues

**Error:** Services can't communicate

**Solutions:**
1. **Use service names in URLs:**
   - Backend should use `db:5432` not `localhost:5433`
   - Frontend should use `backend:5000` for internal calls

2. **Check network configuration:**
   ```bash
   docker network ls
   docker network inspect hotel_network
   ```

## Quick Commands

### Diagnostic Commands
```bash
# Check Docker status
docker info

# Check running containers
docker ps

# Check all containers (including stopped)
docker ps -a

# Check container logs
npm run docker:logs

# Check specific service logs
npm run docker:logs:backend
npm run docker:logs:frontend
npm run docker:logs:db
```

### Reset Everything
```bash
# Nuclear option - reset everything
npm run docker:down
docker system prune -a -f
docker volume prune -f
npm run docker:setup
```

### Enter Containers
```bash
# Enter backend container
npm run docker:shell:backend

# Enter database
npm run docker:shell:db

# Enter frontend container
npm run docker:shell:frontend
```

### Resource Cleanup
```bash
# Clean up old containers and images
npm run docker:clean

# Remove all unused Docker resources
docker system prune -a -f
```

## Environment Setup

### Required Software
- Docker Desktop (latest version)
- Node.js 18+ (for local development)
- At least 4GB RAM available for Docker
- At least 2GB free disk space

### Recommended Settings
- Docker Desktop memory: 4GB+
- Docker Desktop disk space: 64GB+
- Enable "Use containerd for pulling and storing images"

## Getting Help

### Check Service Health
1. **API Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Frontend Check:**
   ```bash
   curl http://localhost:5173
   ```

3. **Database Check:**
   ```bash
   npm run docker:shell:db
   \l  # List databases
   ```

### View Real-time Logs
```bash
# All services
npm run docker:logs

# Specific service
docker-compose logs -f backend
```

### If All Else Fails
1. Restart Docker Desktop
2. Run the setup script: `npm run docker:setup`
3. Check this troubleshooting guide
4. Check Docker Desktop logs (Troubleshoot ? Show logs)

## Common Port Usage
- **5000:** Backend API
- **5173:** Frontend application  
- **5433:** PostgreSQL database
- **5001:** FireTV Server (if running)

Make sure these ports are not used by other applications.