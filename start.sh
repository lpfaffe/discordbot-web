#!/bin/bash
# ============================================================
#  Discord Bot Dashboard – Start-Skript (Debian/Linux)
#  Verwendung: bash start.sh [dev|prod|stop|restart|status|logs]
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
step()  { echo -e "${CYAN}[→]${NC} $1"; }

MODE="${1:-prod}"

# ════════════════════════════════════════════════════════════
#  .env Dateien prüfen (nur eine .env pro Ordner)
# ════════════════════════════════════════════════════════════
setup_env() {
  if [ ! -f "bot/.env" ]; then
    error "bot/.env fehlt! Bitte bot/.env anlegen (siehe DEBIAN-SETUP.md)"
  else
    info "bot/.env vorhanden"
  fi

  if [ ! -f "web/.env" ]; then
    error "web/.env fehlt! Bitte web/.env anlegen (siehe DEBIAN-SETUP.md)"
  else
    info "web/.env vorhanden"
  fi
}

fi

# .env Dateien zuerst sicherstellen
setup_env

# ── Hilfsfunktionen ──────────────────────────────────────────
check_mongodb() {
  if command -v mongod &> /dev/null; then
    if ! systemctl is-active --quiet mongod 2>/dev/null; then
      step "Starte MongoDB..."
      sudo systemctl start mongod 2>/dev/null || mongod --fork --logpath /tmp/mongod.log --dbpath /var/lib/mongodb 2>/dev/null || true
      sleep 2
    fi
    info "MongoDB läuft"
  else
    warn "mongod nicht gefunden – wird als Docker/Remote MongoDB angenommen"
  fi
}

check_node() {
  if ! command -v node &> /dev/null; then
    error "Node.js nicht gefunden! Bitte erst setup-debian.sh ausführen."
    exit 1
  fi
  info "Node.js $(node -v)"
}

check_pm2() {
  if ! command -v pm2 &> /dev/null; then
    step "PM2 installieren..."
    npm install -g pm2
  fi
  info "PM2 $(pm2 -v)"
}

kill_ports() {
  for PORT in 3001 3002; do
    PID=$(lsof -ti:$PORT 2>/dev/null || true)
    if [ -n "$PID" ]; then
      warn "Port $PORT belegt (PID $PID) – beende Prozess..."
      kill -9 $PID 2>/dev/null || true
      sleep 1
    fi
  done
}

build_frontend() {
  if [ ! -d "web/client/dist" ] || [ "$MODE" = "prod" ]; then
    step "React Frontend bauen..."
    npm run build --prefix web/client
    info "Frontend Build fertig"
  fi
}

# ── STOP ─────────────────────────────────────────────────────
if [ "$MODE" = "stop" ]; then
  echo ""
  step "Stoppe alle Dienste..."
  pm2 stop all 2>/dev/null || true
  pm2 delete all 2>/dev/null || true
  info "Alle Dienste gestoppt."
  exit 0
fi

# ── RESTART ──────────────────────────────────────────────────
if [ "$MODE" = "restart" ]; then
  echo ""
  step "Starte alle Dienste neu..."
  pm2 restart all 2>/dev/null || bash "$0" prod
  info "Neustart abgeschlossen."
  exit 0
fi

# ── STATUS ───────────────────────────────────────────────────
if [ "$MODE" = "status" ]; then
  echo ""
  pm2 status
  echo ""
  step "MongoDB:"
  systemctl is-active mongod 2>/dev/null && echo "  MongoDB: aktiv" || echo "  MongoDB: nicht aktiv"
  exit 0
fi

# ── LOGS ─────────────────────────────────────────────────────
if [ "$MODE" = "logs" ]; then
  pm2 logs
  exit 0
fi

# ── DEV-Modus ────────────────────────────────────────────────
if [ "$MODE" = "dev" ]; then
  echo ""
  echo -e "${CYAN}================================================${NC}"
  echo -e "${CYAN}   Discord Bot Dashboard – DEV Modus           ${NC}"
  echo -e "${CYAN}================================================${NC}"
  echo ""

  check_node
  check_mongodb
  kill_ports

  step "Starte Bot (Development)..."
  export NODE_ENV=development
  node bot/src/index.js &
  BOT_PID=$!
  info "Bot gestartet (PID $BOT_PID)"
  sleep 2

  step "Starte Web-Server (Development)..."
  node web/server/app.js &
  WEB_PID=$!
  info "Web-Server gestartet (PID $WEB_PID)"
  sleep 2

  step "Starte Vite Frontend..."
  cd web/client && npx vite &
  VITE_PID=$!
  info "Vite gestartet (PID $VITE_PID)"
  cd "$SCRIPT_DIR"

  echo ""
  echo -e "${GREEN}================================================${NC}"
  echo -e "${GREEN}   Alle Dienste gestartet (DEV)                ${NC}"
  echo -e "${GREEN}================================================${NC}"
  echo ""
  echo -e "  Dashboard: ${YELLOW}http://localhost:5173${NC}"
  echo -e "  API:       ${YELLOW}http://localhost:3001${NC}"
  echo -e "  Bot-API:   ${YELLOW}http://localhost:3002${NC}"
  echo ""
  echo -e "  Beenden mit ${RED}Ctrl+C${NC}"
  echo ""

  trap "kill $BOT_PID $WEB_PID $VITE_PID 2>/dev/null; info 'Alle Prozesse beendet.'" EXIT
  wait

  exit 0
fi

# ── PRODUCTION-Modus (Standard) ──────────────────────────────
echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   Discord Bot Dashboard – PRODUCTION Modus     ${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

check_node
check_pm2
check_mongodb

step "Alte PM2-Prozesse bereinigen..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

kill_ports

build_frontend

# NPM Dependencies prüfen
if [ ! -d "bot/node_modules" ]; then
  step "Bot-Dependencies installieren..."
  npm install --prefix bot
fi
if [ ! -d "web/node_modules" ]; then
  step "Web-Dependencies installieren..."
  npm install --prefix web
fi

step "Starte Dienste mit PM2..."
pm2 start ecosystem.config.js --env production

pm2 save
info "PM2 Prozesse gespeichert (Autostart bei Reboot)"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   Alle Dienste gestartet (PRODUCTION)         ${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "  Bot-API:  intern auf Port ${YELLOW}3002${NC}"
echo -e "  Web-API:  intern auf Port ${YELLOW}3001${NC}"
echo -e "  Website:  ${YELLOW}https://$(hostname -f)${NC} (über Nginx)"
echo ""
echo -e "  Status:   ${CYAN}bash start.sh status${NC}"
echo -e "  Logs:     ${CYAN}bash start.sh logs${NC}"
echo -e "  Stopp:    ${CYAN}bash start.sh stop${NC}"
echo ""
echo -e "  ${YELLOW}SSL aktivieren:${NC} sudo certbot --nginx -d DEINE-DOMAIN"
echo ""

