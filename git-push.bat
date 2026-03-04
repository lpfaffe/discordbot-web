@echo off
cd /d C:\Users\leonp\IdeaProjects\Discordbot-web
git add -A
git status
git commit -m "fix: /help 1024-Limit + ephemeral deprecated + interactionCreate nativer DB"
git push origin main
echo.
echo === FERTIG ===
pause

