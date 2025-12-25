#!/bin/bash

# Hotel Management App Deployment Script

echo "?? Starting deployment process..."

# 1. Build the project
echo "?? Building project..."
npm run build

if [ $? -ne 0 ]; then
  echo "? Build failed!"
  exit 1
fi

# 2. Run database migrations
echo "???  Running database migrations..."
npm run migrate

# 3. Seed admin user (optional, only first time)
# npm run seed-admin

echo "? Deployment complete!"
echo ""
echo "Backend is ready at: dist/index.js"
echo "Frontend is ready at: frontend/dist/"
echo ""
echo "To start the backend: npm run start:backend"
echo "To start with PM2: pm2 start backend/dist/index.js --name hotel-backend"
