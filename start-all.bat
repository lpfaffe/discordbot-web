@echo off
title Discord Bot Dashboard - Starter
echo ========================================
echo   Discord Bot Dashboard - Start
echo ========================================
echo.

REM === Alte Prozesse auf den Ports beenden ===
echo [0/4] Bereinige alte Prozesse...
for /f "tokens=5" %%a in ('netstat -ano 2^>NUL ^| findstr ":3001 " ^| findstr "ABHREN"') do (
    echo  Beende Prozess auf Port 3001 (PID %%a)
    taskkill /PID %%a /F >NUL 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>NUL ^| findstr ":3002 " ^| findstr "ABHREN"') do (
    echo  Beende Prozess auf Port 3002 (PID %%a)
    taskkill /PID %%a /F >NUL 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>NUL ^| findstr ":5173 " ^| findstr "ABHREN"') do (
    echo  Beende Prozess auf Port 5173 (PID %%a)
    taskkill /PID %%a /F >NUL 2>&1
)
timeout /t 2 /nobreak >NUL
echo OK: Ports bereinigt

REM === MongoDB prüfen/starten ===
echo.
echo [1/4] Starte MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I "mongod.exe" >NUL
if %ERRORLEVEL% EQU 0 (
    echo OK: MongoDB laeuft bereits
) else (
    if exist "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" (
        if not exist "%USERPROFILE%\mongodb-data" mkdir "%USERPROFILE%\mongodb-data"
        start "MongoDB" /MIN "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "%USERPROFILE%\mongodb-data" --port 27017 --bind_ip 127.0.0.1
        timeout /t 4 /nobreak >NUL
        echo OK: MongoDB gestartet
    ) else (
        echo WARNUNG: mongod.exe nicht gefunden!
    )
)

REM === Bot starten ===
echo.
echo [2/4] Starte Discord Bot (Port 3002)...
start "Discord Bot" /D "%~dp0bot" cmd /k "node src/index.js"
timeout /t 3 /nobreak >NUL

REM === Web-Server starten ===
echo.
echo [3/4] Starte Web-Server (Port 3001)...
start "Web-Server" /D "%~dp0web" cmd /k "node server/app.js"
timeout /t 2 /nobreak >NUL

REM === Vite Frontend starten ===
echo.
echo [4/4] Starte Vite Frontend (Port 5173)...
start "Vite Frontend" /D "%~dp0web\client" cmd /k "npx vite"

echo.
echo ========================================
echo   Alle Dienste gestartet!
echo ========================================
echo.
echo  Dashboard (Webseite): http://localhost:5173
echo  API-Server:           http://localhost:3001
echo  Bot-API:              http://localhost:3002
echo  MongoDB:              mongodb://localhost:27017
echo.
echo HINWEIS: Die Webseite ist unter localhost:5173 erreichbar,
echo          NICHT unter localhost:3001 !
echo.
echo Dieses Fenster kann geschlossen werden.
echo.
pause
