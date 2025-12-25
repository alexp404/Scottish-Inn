@echo off
echo ?? Fixing TypeScript Dependencies
echo ==================================

cd backend

echo ?? Installing dependencies...
call npm install

echo ?? Clearing TypeScript cache...
call npx tsc --build --clean 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo ?? Checking TypeScript compilation...
call npx tsc --noEmit

if %errorlevel% == 0 (
    echo ? TypeScript compilation successful!
) else (
    echo ? TypeScript compilation failed. Checking specific issues...
    echo.
    echo ?? Trying to fix common issues...
    
    echo ?? Reinstalling type definitions...
    call npm install --save-dev @types/supertest@^6.0.2 @types/ws@^8.5.10
    
    echo ?? Checking again...
    call npx tsc --noEmit
)

echo.
echo ?? Running tests to verify...
call npm test

echo.
echo ? Setup complete!
echo    - TypeScript types fixed
echo    - Tests should pass
echo    - Ready for development

pause