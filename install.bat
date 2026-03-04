@echo off
echo ========================================
echo   Discord Bot Dashboard - Setup
echo ========================================
echo.

echo [1/4] Pruefe Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo FEHLER: Node.js ist nicht installiert!
    echo Bitte installiere Node.js von: https://nodejs.org
    pause
    exit /b 1
)
echo OK: Node.js gefunden

echo.
echo [2/4] Installiere Root-Abhaengigkeiten...
call npm install
if errorlevel 1 ( echo FEHLER bei Root-Install && pause && exit /b 1 )

echo.
echo [3/4] Installiere Bot-Abhaengigkeiten...
cd bot
call npm install
if errorlevel 1 ( echo FEHLER bei Bot-Install && pause && exit /b 1 )
cd ..

echo.
echo [4/4] Installiere Web-Abhaengigkeiten...
cd web
call npm install
if errorlevel 1 ( echo FEHLER bei Web-Install && pause && exit /b 1 )
cd client
call npm install
if errorlevel 1 ( echo FEHLER bei Client-Install && pause && exit /b 1 )
cd ../..

echo.
echo ========================================
echo   Installation abgeschlossen!
echo ========================================
echo.
echo Naechste Schritte:
echo 1. Kopiere .env.example nach bot\.env und web\.env
echo 2. Fuege deine Discord Token, Client ID, Client Secret ein
echo 3. Starte MongoDB (lokal oder nutze MongoDB Atlas)
echo 4. Fuehre aus: cd bot ^&^& npm run deploy
echo 5. Starte alles mit: npm run dev (aus dem Root-Verzeichnis)
echo.
echo Dashboard: http://localhost:5173
echo Bot API:   http://localhost:3002
echo.
pause

