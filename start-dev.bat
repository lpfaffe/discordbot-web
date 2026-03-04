@echo off
chcp 65001 >nul
echo.
echo  Discordbot-Web - Dev Start
echo  ==========================
echo.

echo [1/4] Beende alle laufenden Node-Prozesse...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo  OK - Node-Prozesse beendet.

echo [2/4] Pruefe .env Dateien...
if not exist "%~dp0web\.env" (
  echo  WARNUNG: web\.env fehlt!
  if exist "%~dp0web\.env.example" (
    copy "%~dp0web\.env.example" "%~dp0web\.env" >nul
    echo  .env aus .env.example erstellt
  )
)
if not exist "%~dp0bot\.env" (
  echo  WARNUNG: bot\.env fehlt!
  if exist "%~dp0bot\.env.example" (
    copy "%~dp0bot\.env.example" "%~dp0bot\.env" >nul
  )
)

echo [3/4] Starte Discord Bot...
start "Discord Bot" cmd /k "cd /d %~dp0bot && echo Bot startet... && node src/index.js"
timeout /t 3 /nobreak >nul

echo [4/4] Starte Web-Server und Frontend...
start "Web Server" cmd /k "cd /d %~dp0web && echo Web startet... && npm run dev"

echo.
echo  Gestartet! Bitte warte 5-10 Sekunden...
echo.
echo   Dashboard:  http://localhost:5173
echo   Web-API:    http://localhost:3001
echo   Bot-API:    http://localhost:3002
echo.
echo  Fenster schliessen = Server stoppen
echo.
pause
