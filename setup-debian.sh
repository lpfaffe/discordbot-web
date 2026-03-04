#!/bin/bash
# ============================================================
#  Discord Bot Dashboard – Debian/Ubuntu Setup-Skript
#  Einmalig ausführen: sudo bash setup-debian.sh
# ============================================================
set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

if [ "$EUID" -ne 0 ]; then
  error "Bitte als root ausführen: sudo bash setup-debian.sh"
fi

info "=== Discord Bot Dashboard – Debian Setup ==="
echo ""

# ── 1. System-Updates ───────────────────────────────────────
info "[1/7] System-Pakete aktualisieren..."
apt-get update -y
apt-get upgrade -y
apt-get install -y curl wget gnupg2 software-properties-common \
  build-essential git nginx certbot python3-certbot-nginx \
  ufw ffmpeg yt-dlp

# ── 2. Node.js 20 LTS ───────────────────────────────────────
info "[2/7] Node.js 20 LTS installieren..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  NODE_VER=$(node -v | cut -d. -f1 | tr -d 'v')
  if [ "$NODE_VER" -lt 18 ]; then
    warn "Node.js zu alt ($NODE_VER). Aktualisiere..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  else
    info "Node.js $(node -v) bereits installiert."
  fi
fi

# ── 3. PM2 (Prozess-Manager) ────────────────────────────────
info "[3/7] PM2 installieren..."
npm install -g pm2
pm2 startup systemd -u "$SUDO_USER" --hp "/home/$SUDO_USER" || true

# ── 4. MongoDB ──────────────────────────────────────────────
info "[4/7] MongoDB 7 installieren..."
if ! command -v mongod &> /dev/null; then
  curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
    https://repo.mongodb.org/apt/debian bookworm/mongodb-org/7.0 main" \
    > /etc/apt/sources.list.d/mongodb-org-7.0.list
  apt-get update -y
  apt-get install -y mongodb-org
  systemctl enable mongod
  systemctl start mongod
  info "MongoDB gestartet."
else
  info "MongoDB bereits installiert."
  systemctl enable mongod
  systemctl start mongod || true
fi

# ── 5. Firewall ──────────────────────────────────────────────
info "[5/7] UFW Firewall konfigurieren..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
info "Firewall aktiv. Nur SSH + HTTP(S) offen."

# ── 6. Nginx Basis-Config ───────────────────────────────────
info "[6/7] Nginx Basis-Konfiguration..."
PROJ_DIR="$(cd "$(dirname "$0")" && pwd)"

# Nginx-Konfiguration wird von nginx.conf übernommen (siehe unten)
if [ -f "$PROJ_DIR/nginx.conf" ]; then
  cp "$PROJ_DIR/nginx.conf" /etc/nginx/sites-available/discordbot
  ln -sf /etc/nginx/sites-available/discordbot /etc/nginx/sites-enabled/discordbot
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  info "Nginx konfiguriert."
else
  warn "nginx.conf nicht gefunden. Manuelle Konfiguration erforderlich."
fi

# ── 7. NPM-Abhängigkeiten installieren ──────────────────────
info "[7/7] NPM-Abhängigkeiten installieren..."
cd "$PROJ_DIR"

# Web-Dependencies
npm install --prefix web
npm install --prefix web/client
npm install --prefix bot

# Frontend Build
info "React Frontend bauen..."
npm run build --prefix web/client

echo ""
info "=========================================="
info "  Setup abgeschlossen!"
info "=========================================="
echo ""
echo -e "  Nächste Schritte:"
echo -e "  1. ${YELLOW}.env${NC} Datei anpassen (cp .env.example .env && nano .env)"
echo -e "  2. ${YELLOW}bash start.sh${NC} ausführen (als normaler User, nicht root!)"
echo -e "  3. SSL-Zertifikat: ${YELLOW}sudo certbot --nginx -d DEINE-DOMAIN${NC}"
echo ""
warn "WICHTIG: Passe die Domain in nginx.conf an und lade sie neu!"
echo ""

