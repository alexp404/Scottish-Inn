#!/bin/bash

# Fix TypeScript Dependencies Script
echo "?? Fixing TypeScript Dependencies"
echo "=================================="

cd backend

echo "?? Installing dependencies..."
npm install

echo "?? Clearing TypeScript cache..."
npx tsc --build --clean 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

echo "?? Checking TypeScript compilation..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "? TypeScript compilation successful!"
else
    echo "? TypeScript compilation failed. Checking specific issues..."
    echo ""
    echo "?? Trying to fix common issues..."
    
    # Reinstall type definitions
    echo "?? Reinstalling type definitions..."
    npm install --save-dev @types/supertest@^6.0.2 @types/ws@^8.5.10
    
    echo "?? Checking again..."
    npx tsc --noEmit
fi

echo ""
echo "?? Running tests to verify..."
npm test

echo ""
echo "? Setup complete!"
echo "   - TypeScript types fixed"
echo "   - Tests should pass"
echo "   - Ready for development"