@echo off
cls
echo ========================================
echo    COLLABSPACE PRO - FINAL SUBMISSION
echo ========================================
echo.
echo 📋 PROJECT SUMMARY:
echo    • Professional Collaboration Platform
echo    • MS Word-like Document Editor
echo    • Real-time Collaboration
echo    • 14+ Professional Templates
echo    • Advanced Dashboard with Analytics
echo.
echo 🎯 SUBMISSION READY FEATURES:
echo    ✅ Landing Page (Marketing)
echo    ✅ Authentication System
echo    ✅ Advanced Dashboard
echo    ✅ Professional Document Editor
echo    ✅ Real-time Collaboration
echo    ✅ Template Library
echo    ✅ Export Functionality
echo    ✅ Responsive Design
echo.
echo 🚀 STARTING SYSTEM...
echo.

echo 📊 Starting MongoDB...
net start MongoDB 2>nul
if %errorlevel% neq 0 (
    start "MongoDB" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"
    timeout /t 2 /nobreak > nul
)

echo 🔧 Starting Server...
cd server
start "CollabSpace Server" cmd /k "echo ✅ Server Ready: http://localhost:5000 && node server.js"

echo 🎨 Starting Client...
cd ..\client
start "CollabSpace Client" cmd /k "echo ✅ Client Ready: http://localhost:3000 && npm start"

echo.
echo ========================================
echo     🎉 SUBMISSION SYSTEM READY!
echo ========================================
echo.
echo 🌐 URL: http://localhost:3000
echo.
echo 📱 DEMO FLOW:
echo    1. Landing Page → Get Started
echo    2. Sign In → Use Demo Account
echo    3. Dashboard → Create/Manage Documents
echo    4. Document Editor → Professional Editing
echo.
echo 🎯 ACADEMIC SUBMISSION COMPLETE!
echo.
echo Opening website in 3 seconds...
timeout /t 3 /nobreak > nul
start http://localhost:3000

echo.
echo Press any key to exit...
pause > nul