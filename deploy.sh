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

# 1b. System-Abhängigkeiten für Musik prüfen
step "System-Abhängigkeiten prüfen..."
if ! command -v ffmpeg &>/dev/null; then
  warn "ffmpeg nicht gefunden – installiere..."
  apt-get install -y ffmpeg 2>/dev/null || warn "ffmpeg Installation fehlgeschlagen (sudo erforderlich)"
else
  info "ffmpeg: $(ffmpeg -version 2>&1 | head -1)"
fi
if ! command -v yt-dlp &>/dev/null; then
  warn "yt-dlp nicht gefunden – installiere..."
  pip3 install -U yt-dlp 2>/dev/null || pip install -U yt-dlp 2>/dev/null || warn "yt-dlp Installation fehlgeschlagen"
else
  info "yt-dlp: $(yt-dlp --version 2>/dev/null)"
fi

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
step "Bot-Dependencies (inkl. neue Voice-Pakete)..."
npm install --prefix bot --omit=dev
info "Bot npm install fertig"

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

# ── BOT_API_KEY direkt in PM2 env injizieren ─────────────────
# PM2 reload/restart liest .env manchmal nicht neu – daher setzen wir
# den Key explizit via 'pm2 set' damit er garantiert ankommt
step "BOT_API_KEY in PM2 setzen..."
FINAL_KEY_INJECT=$(grep '^BOT_API_KEY=' bot/.env | cut -d'=' -f2- | tr -d '\r\n')
if [ -n "$FINAL_KEY_INJECT" ]; then
  # Setze Key direkt als PM2 env-Variable (wird bei restart übergeben)
  pm2 set discord-bot:BOT_API_KEY "$FINAL_KEY_INJECT" 2>/dev/null || true
  info "BOT_API_KEY in PM2 gesetzt"
fi

# 6. PM2 neu starten
step "Dienste neu starten..."
# Bei PM2-Fehlern (Process not found etc.) komplett neu starten
pm2 delete discord-bot 2>/dev/null || true
pm2 delete web-server  2>/dev/null || true
sleep 1
pm2 start ecosystem.config.js --env production
pm2 save
info "PM2 neu gestartet"

# 7. Verbindungstest – mit Retry bis zu 30s warten
step "Verbindungstests (warte auf Bot-Start, max 30s)..."

BOT_PORT_TEST=$(grep '^BOT_API_PORT=' bot/.env | cut -d'=' -f2- | tr -d '\r\n')
BOT_PORT_TEST="${BOT_PORT_TEST:-3002}"
FINAL_KEY=$(grep '^BOT_API_KEY=' bot/.env | cut -d'=' -f2- | tr -d '\r\n')

# Warte bis Bot-API antwortet (max 30s)
BOT_STATUS="000"
for i in 1 2 3 4 5 6; do
  sleep 5
  BOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "x-api-key: ${FINAL_KEY}" \
    "http://127.0.0.1:${BOT_PORT_TEST}/status" 2>/dev/null || echo "000")
  if [ "$BOT_STATUS" = "200" ] || [ "$BOT_STATUS" = "401" ]; then
    break
  fi
  echo "  ... noch nicht bereit (${i}/6), warte..."
done

if [ "$BOT_STATUS" = "200" ]; then
  info "Bot-API erreichbar (Port ${BOT_PORT_TEST}) ✅"
elif [ "$BOT_STATUS" = "401" ]; then
  error "Bot-API: 401 Unauthorized – BOT_API_KEY wird vom Bot nicht erkannt!"
  echo ""
  echo "  ╔═══════════════════════════════════════════════╗"
  echo "  ║  LÖSUNG: Bot manuell neu starten              ║"
  echo "  ║  pm2 stop discord-bot                         ║"
  echo "  ║  pm2 start discord-bot                        ║"
  echo "  ╚═══════════════════════════════════════════════╝"
  echo ""
  echo "  Bot-Key in bot/.env:  $(grep '^BOT_API_KEY=' bot/.env)"
  echo "  Web-Key in web/.env:  $(grep '^BOT_API_KEY=' web/.env)"
  # Trotzdem mit pm2 stop/start versuchen
  warn "Versuche Bot-Neustart..."
  pm2 stop discord-bot 2>/dev/null || true
  sleep 2
  pm2 start discord-bot --update-env 2>/dev/null || true
  sleep 8
  BOT_STATUS2=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "x-api-key: ${FINAL_KEY}" \
    "http://127.0.0.1:${BOT_PORT_TEST}/status" 2>/dev/null || echo "000")
  if [ "$BOT_STATUS2" = "200" ]; then
    info "Bot-API nach Neustart erreichbar ✅"
  else
    error "Immer noch nicht OK (${BOT_STATUS2}). Prüfe: pm2 logs discord-bot"
  fi
else
  warn "Bot-API antwortet nicht (Status: ${BOT_STATUS})"
  warn "Prüfe: pm2 logs discord-bot"
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
