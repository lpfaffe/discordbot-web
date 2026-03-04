#!/bin/bash
# ============================================================
#  Deploy – nach git pull alles neu starten
#  Verwendung: bash deploy.sh
# ============================================================

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $1"; }
step()  { echo -e "${CYAN}[→]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }

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
for envfile in web/.env bot/.env; do
  if [ -f "$envfile" ]; then
    sed -i 's/\r//' "$envfile"
    info "$envfile bereinigt"
  fi
done

# ── .env Existenz prüfen ─────────────────────────────────────
if [ ! -f "web/.env" ]; then
  error "web/.env fehlt! Bitte erstellen."
  echo "  Vorlage: cp web/.env.example web/.env && nano web/.env"
  exit 1
fi
if [ ! -f "bot/.env" ]; then
  error "bot/.env fehlt! Bitte erstellen."
  exit 1
fi

# ── BOT_API_KEY zwischen bot/.env und web/.env synchronisieren ──
step "BOT_API_KEY synchronisieren..."
BOT_KEY_BOT=$(grep '^BOT_API_KEY=' bot/.env | cut -d'=' -f2- | tr -d '\r\n')
BOT_KEY_WEB=$(grep '^BOT_API_KEY=' web/.env | cut -d'=' -f2- | tr -d '\r\n')

if [ -z "$BOT_KEY_BOT" ]; then
  # Key in bot/.env fehlt → aus web/.env übernehmen oder neu generieren
  if [ -n "$BOT_KEY_WEB" ]; then
    echo "BOT_API_KEY=${BOT_KEY_WEB}" >> bot/.env
    BOT_KEY_BOT="$BOT_KEY_WEB"
    warn "BOT_API_KEY in bot/.env ergänzt (aus web/.env)"
  else
    NEW_KEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | head -c 40)
    echo "BOT_API_KEY=${NEW_KEY}" >> bot/.env
    echo "BOT_API_KEY=${NEW_KEY}" >> web/.env
    BOT_KEY_BOT="$NEW_KEY"
    warn "Neuer BOT_API_KEY generiert und in beide .env eingetragen"
  fi
fi

if [ "$BOT_KEY_BOT" != "$BOT_KEY_WEB" ]; then
  warn "BOT_API_KEY Unterschied erkannt → synchronisiere..."
  # web/.env mit Bot-Key aktualisieren
  if grep -q '^BOT_API_KEY=' web/.env; then
    sed -i "s|^BOT_API_KEY=.*|BOT_API_KEY=${BOT_KEY_BOT}|" web/.env
  else
    echo "BOT_API_KEY=${BOT_KEY_BOT}" >> web/.env
  fi
  info "BOT_API_KEY synchronisiert"
else
  info "BOT_API_KEY OK (übereinstimmend)"
fi

# ── BOT_API_URL sicherstellen ────────────────────────────────
if ! grep -q '^BOT_API_URL=' web/.env; then
  BOT_PORT=$(grep '^BOT_API_PORT=' bot/.env | cut -d'=' -f2- | tr -d '\r\n')
  BOT_PORT="${BOT_PORT:-3002}"
  echo "BOT_API_URL=http://127.0.0.1:${BOT_PORT}" >> web/.env
  warn "BOT_API_URL in web/.env ergänzt"
fi

# 3. Dependencies
step "Bot-Dependencies..."
npm install --prefix bot --omit=dev

step "Web-Server-Dependencies..."
npm install --prefix web --omit=dev

step "Web-Client-Dependencies..."
npm install --prefix web/client

# 4. Frontend bauen
step "Frontend bauen..."
npm run build --prefix web/client
info "Frontend gebaut"

# 5. Log-Verzeichnisse
mkdir -p bot/logs web/logs

# 6. PM2 neu starten
step "Dienste neu starten..."
# WICHTIG: restart (nicht reload) damit .env neu eingelesen wird!
if pm2 list 2>/dev/null | grep -q "discord-bot\|web-server"; then
  pm2 restart ecosystem.config.js --env production
  pm2 save
  info "PM2 neu gestartet (.env wird neu geladen)"
else
  pm2 start ecosystem.config.js --env production
  pm2 save
  info "PM2 gestartet"
fi

# 7. Verbindungstest nach 10s (Bot braucht Zeit zum Starten)
step "Verbindungstests (warte 10s auf Bot-Start)..."
sleep 10

BOT_PORT_TEST=$(grep '^BOT_API_PORT=' bot/.env | cut -d'=' -f2- | tr -d '\r\n')
BOT_PORT_TEST="${BOT_PORT_TEST:-3002}"
FINAL_KEY=$(grep '^BOT_API_KEY=' bot/.env | cut -d'=' -f2- | tr -d '\r\n')

# Bot-API Test
BOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "x-api-key: ${FINAL_KEY}" \
  "http://127.0.0.1:${BOT_PORT_TEST}/status" 2>/dev/null || echo "000")

if [ "$BOT_STATUS" = "200" ]; then
  info "Bot-API erreichbar (Port ${BOT_PORT_TEST}) ✅"
elif [ "$BOT_STATUS" = "401" ]; then
  error "Bot-API: 401 Unauthorized – BOT_API_KEY stimmt nicht!"
  echo "  Bot-Key:  $(grep '^BOT_API_KEY=' bot/.env)"
  echo "  Web-Key:  $(grep '^BOT_API_KEY=' web/.env)"
else
  warn "Bot-API antwortet nicht (Status: ${BOT_STATUS}) – Bot läuft evtl. noch nicht"
fi

# Web-Server Test
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "http://127.0.0.1:3001/auth/me" 2>/dev/null || echo "000")
if [ "$WEB_STATUS" != "000" ]; then
  info "Web-Server erreichbar (Port 3001) ✅"
else
  warn "Web-Server nicht erreichbar"
fi

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   Deploy abgeschlossen!                       ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
pm2 status
echo ""
echo -e "${CYAN}Logs ansehen: pm2 logs${NC}"
echo -e "${CYAN}Bot-Key prüfen: grep BOT_API_KEY bot/.env web/.env${NC}"
echo ""
