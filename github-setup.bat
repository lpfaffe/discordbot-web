@echo off
title GitHub Setup – Discord Bot Dashboard
echo ========================================
echo   GitHub Setup – Discord Bot Dashboard
echo ========================================
echo.

REM ── 1. Git installieren falls nicht vorhanden ──────────────
where git >NUL 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [1/5] Git wird installiert...
    winget install --id Git.Git -e --source winget --silent --accept-package-agreements --accept-source-agreements
    if %ERRORLEVEL% NEQ 0 (
        echo FEHLER: winget nicht verfuegbar.
        echo Bitte Git manuell installieren: https://git-scm.com/download/win
        pause
        exit /b 1
    )
    REM PATH neu laden
    set "PATH=%PATH%;C:\Program Files\Git\cmd"
    echo OK: Git installiert
) else (
    echo [1/5] Git bereits installiert
)

REM ── 2. Variablen abfragen ───────────────────────────────────
echo.
echo [2/5] GitHub Repository einrichten
echo.
set /p GITHUB_USER=Dein GitHub-Benutzername:
set /p REPO_NAME=Repository-Name (z.B. discordbot-dashboard):
set /p GIT_EMAIL=Deine GitHub E-Mail:
set /p GIT_NAME=Dein Name (fuer Commits):

echo.
echo  GitHub User : %GITHUB_USER%
echo  Repo-Name   : %REPO_NAME%
echo  E-Mail      : %GIT_EMAIL%
echo  Name        : %GIT_NAME%
echo.
set /p CONFIRM=Stimmt das? (j/n):
if /i "%CONFIRM%" NEQ "j" (
    echo Abgebrochen.
    pause
    exit /b 0
)

REM ── 3. Git konfigurieren ───────────────────────────────────
echo.
echo [3/5] Git konfigurieren...
"C:\Program Files\Git\cmd\git.exe" config --global user.email "%GIT_EMAIL%"
"C:\Program Files\Git\cmd\git.exe" config --global user.name "%GIT_NAME%"
"C:\Program Files\Git\cmd\git.exe" config --global init.defaultBranch main
echo OK: Git konfiguriert

REM ── 4. Repository initialisieren ───────────────────────────
echo.
echo [4/5] Lokales Repository einrichten...
cd /d "C:\Users\leonp\IdeaProjects\Discordbot-web"

if not exist ".git" (
    "C:\Program Files\Git\cmd\git.exe" init
    echo OK: Git initialisiert
) else (
    echo OK: Git bereits initialisiert
)

REM .gitignore pruefen
if not exist ".gitignore" (
    echo node_modules/ > .gitignore
    echo .env >> .gitignore
    echo .env.production >> .gitignore
    echo dist/ >> .gitignore
    echo build/ >> .gitignore
    echo *.log >> .gitignore
    echo .DS_Store >> .gitignore
    echo bot/logs/ >> .gitignore
    echo web/logs/ >> .gitignore
)

REM Alle Dateien hinzufuegen
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Initial commit: Discord Bot Dashboard"

REM Remote setzen
"C:\Program Files\Git\cmd\git.exe" remote remove origin >NUL 2>&1
"C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git

echo.
echo [5/5] Zum GitHub pushen...
echo.
echo HINWEIS: Du brauchst ein GitHub Personal Access Token (PAT)!
echo  → https://github.com/settings/tokens/new
echo  → Scopes: repo (alles)
echo  → Token kopieren
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main

echo.
echo ========================================
echo   Fertig! Repository auf GitHub:
echo   https://github.com/%GITHUB_USER%/%REPO_NAME%
echo ========================================
echo.
echo Naechste Schritte auf dem Debian-Server:
echo   git clone https://github.com/%GITHUB_USER%/%REPO_NAME%.git /var/www/discordbot
echo   cd /var/www/discordbot
echo   bash setup-debian.sh
echo.
pause

