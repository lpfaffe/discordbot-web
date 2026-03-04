#!/bin/bash
# ============================================================
#  Deploy – nach git pull alles neu starten
#  Verwendung: bash deploy.sh
# ============================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $1"; }
step()  { echo -e "${CYAN}[→]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   Discord Bot Dashboard – Deploy              ${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# 1. Git Pull
step "Neueste Version holen..."
git pull origin main || git pull origin master
info "Code aktualisiert"

# 2. \r aus .env entfernen (Windows → Linux)
if [ -f "web/.env" ]; then
  sed -i 's/\r//' web/.env
  info "web/.env bereinigt"
fi
if [ -f "bot/.env" ]; then
  sed -i 's/\r//' bot/.env
  info "bot/.env bereinigt"
fi

# 3. Dependencies
step "Bot-Dependencies..."
npm install --prefix bot --omit=dev

step "Web-Dependencies..."
npm install --prefix web --omit=dev

# 4. Frontend bauen
step "Frontend bauen..."
npm install --prefix web/client --omit=dev
npm run build --prefix web/client
info "Frontend gebaut"

# 5. Log-Verzeichnisse
mkdir -p bot/logs web/logs

# 6. PM2 neu starten
step "Dienste neu starten..."
if pm2 list 2>/dev/null | grep -q "discord-bot\|web-server"; then
  pm2 reload ecosystem.config.js --env production
  info "PM2 neu geladen (Zero-Downtime)"
else
  pm2 start ecosystem.config.js --env production
  pm2 save
  info "PM2 gestartet"
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   Deploy abgeschlossen!                       ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
pm2 status
echo ""
