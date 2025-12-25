# ?? Docker Quick Start Guide

## Fixed Issues ?

1. **Removed obsolete `version` field** from docker-compose.yml
2. **Added proper health checks** for all services
3. **Added container names** for easier management
4. **Added restart policies** for production stability
5. **Created setup scripts** for both Windows and Unix systems

## Quick Start (3 Steps)

### Step 1: Start Docker Desktop
- **Windows:** Search "Docker Desktop" in Start menu
- **Mac:** Open Docker from Applications
- **Linux:** `sudo systemctl start docker`

Wait for the Docker whale icon to be steady (not animated).

### Step 2: Run Setup Script
```bash
# Automated setup (recommended)
npm run docker:setup

# OR manual setup
npm run docker:up
```

### Step 3: Open Application
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000/api/health
- **Database:** Use any PostgreSQL client on port 5433

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run docker:setup` | ?? **Automated setup** (recommended) |
| `npm run docker:up` | Start all services |
| `npm run docker:down` | Stop all services |
| `npm run docker:logs` | View all logs |
| `npm run docker:restart` | Restart services |
| `npm run docker:clean` | Clean up old containers |

## Service URLs

- **Frontend Application:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health
- **Database:** postgresql://hotel_user:180496@localhost:5433/hotelDB

## Troubleshooting

### Common Errors

1. **"Docker Desktop not running"**
   - Start Docker Desktop and wait for full startup
   - Check system tray for steady whale icon

2. **"Port already in use"**
   - Stop local dev servers: `Ctrl+C` on running `npm run dev`
   - Or change ports in docker-compose.yml

3. **Build failures**
   - Run: `npm run docker:clean && npm run docker:build`

### Need Help?
- Check **DOCKER_TROUBLESHOOTING.md** for detailed solutions
- Run `npm run docker:logs` to see what's happening
- Use `npm run docker:setup` for automated fixes

## Development Workflow

### Local Development (recommended)
```bash
npm run dev  # Runs frontend + backend locally
```

### Docker Development
```bash
npm run docker:up     # Start containers
npm run docker:logs   # Monitor logs
npm run docker:down   # Stop when done
```

### Switching Between Local and Docker

**From Local ? Docker:**
```bash
# Stop local servers (Ctrl+C)
npm run docker:up
```

**From Docker ? Local:**
```bash
npm run docker:down
npm run dev
```

## Production Deployment

For production, use:
```bash
npm run build
npm run docker:build
npm run docker:up
```

Environment variables are already configured in docker-compose.yml.

---

**?? That's it!** Your hotel management app should now be running on:
- http://localhost:5173 (frontend)
- http://localhost:5000 (backend)