@echo off
cd /d C:\Users\leonp\IdeaProjects\Discordbot-web
git add ecosystem.config.js deploy.sh bot/src/api/botApi.js
git commit -m "fix: BOT_API_KEY 3-Ebenen Fix"
git push origin main
echo.
echo Fertig! Druecke eine Taste...
pause

