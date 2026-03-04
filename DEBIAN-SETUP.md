# 🐧 Debian Server Setup – Discord Bot Dashboard

## Voraussetzungen

- Debian 11/12 (Bullseye/Bookworm) oder Ubuntu 22.04+
- Root-Zugriff oder sudo-Rechte
- Eine Domain, die auf die Server-IP zeigt (DNS A-Record)
- Discord Application mit OAuth2 konfiguriert

---

## 📋 Schritt-für-Schritt Anleitung

### 1. Projekt auf den Server kopieren

```bash
# Option A: Via Git
git clone https://github.com/DEIN_REPO/Discordbot-web.git /var/www/discordbot
cd /var/www/discordbot

# Option B: Via SCP (von Windows)
scp -r C:\Users\leonp\IdeaProjects\Discordbot-web user@SERVER-IP:/var/www/discordbot
```

### 1b. Nginx manuell installieren (falls setup-debian.sh nicht genutzt)

```bash
# Nginx installieren
sudo apt-get update
sudo apt-get install -y nginx

# Nginx starten + Autostart aktivieren
sudo systemctl start nginx
sudo systemctl enable nginx

# Status prüfen
sudo systemctl status nginx

# Konfiguration kopieren
sudo cp nginx.conf /etc/nginx/sites-available/discordbot
sudo ln -sf /etc/nginx/sites-available/discordbot /etc/nginx/sites-enabled/discordbot
sudo rm -f /etc/nginx/sites-enabled/default

# Domain anpassen (DEINE-DOMAIN.de ersetzen!)
sudo nano /etc/nginx/sites-available/discordbot

# Konfiguration testen + neu laden
sudo nginx -t
sudo systemctl reload nginx
```

---

### 2. Einmaliges Setup ausführen

```bash
cd /var/www/discordbot
sudo bash setup-debian.sh
```

Das Skript installiert automatisch:
- Node.js 20 LTS
- PM2 (Prozess-Manager)
- MongoDB 7
- Nginx (Reverse Proxy)
- UFW Firewall (nur SSH + HTTP/HTTPS offen)
- ffmpeg + yt-dlp (für Musik-Bot)

### 3. Umgebungsvariablen konfigurieren

Es gibt **zwei** `.env` Dateien – eine für Bot, eine für Web. Beide sind bereits fertig konfiguriert und werden mit dem Projekt übertragen.

```bash
# Prüfen ob die .env Dateien da sind
ls -la bot/.env
ls -la web/.env
```

**`bot/.env`** – wichtige Werte:
```env
DISCORD_TOKEN=...
DISCORD_CLIENT_ID=...
MONGODB_URI=mongodb://127.0.0.1:27017/discordbot
NODE_ENV=production
```

**`web/.env`** – wichtige Werte:
```env
DISCORD_CALLBACK_URL=https://rls-nds.eu/auth/callback
FRONTEND_URL=https://rls-nds.eu
NODE_ENV=production
```

> ⚠️ Keine `.env.example` oder `.env.production` mehr nötig – nur die eine `.env` pro Ordner!

### 4. Discord OAuth2 Callback URL setzen

Im Discord Developer Portal → OAuth2 → Redirects:
```
https://rls-nds.eu/auth/callback
```

### 5. Nginx Domain anpassen

```bash
sudo cp nginx.conf /etc/nginx/sites-available/discordbot
sudo ln -sf /etc/nginx/sites-available/discordbot /etc/nginx/sites-enabled/discordbot
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL-Zertifikat (HTTPS) aktivieren

```bash
sudo certbot --nginx -d rls-nds.eu -d www.rls-nds.eu
```

Certbot erneuert das Zertifikat automatisch!

### 7. Bot starten

```bash
# Als normaler User (nicht root)!
bash start.sh
# oder:
bash start.sh prod
```

---

## 🚀 Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `bash start.sh` | Production-Start |
| `bash start.sh dev` | Development-Start (mit Vite) |
| `bash start.sh stop` | Alle Dienste stoppen |
| `bash start.sh restart` | Neustart |
| `bash start.sh status` | Status anzeigen |
| `bash start.sh logs` | Logs anzeigen |
| `bash deploy.sh` | Update deployen (Git Pull + Rebuild) |

---

## 🏗️ Architektur (Production)

```
Internet
    │
    ▼
Nginx :80/:443  (nur diese Ports außen offen)
    │
    ├── /api/*    → Web-Server :3001 (intern)
    ├── /auth/*   → Web-Server :3001 (intern)
    └── /*        → Web-Server :3001 → React App (dist/)

Web-Server :3001 ──→ Bot-API :3002 (intern)
Bot :3002  ──────→ MongoDB :27017 (intern)
```

**Extern erreichbar:** Nur Port 80 und 443 (über Nginx)  
**Intern:** Port 3001 (Web), 3002 (Bot-API), 27017 (MongoDB)

---

## 🔄 Autostart nach Reboot

PM2 startet die Dienste automatisch nach einem Server-Neustart.

```bash
# Status prüfen
pm2 status

# Logs anschauen
pm2 logs

# Einzelnen Dienst neu starten
pm2 restart discord-bot
pm2 restart web-server
```

---

## 🔧 Troubleshooting

### Port bereits belegt
```bash
sudo lsof -i :3001
sudo kill -9 <PID>
```

### MongoDB läuft nicht
```bash
sudo systemctl status mongod
sudo systemctl start mongod
```

### Nginx Fehler
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/discordbot-error.log
```

### Bot-Logs
```bash
pm2 logs discord-bot
# oder
cat bot/logs/bot-error.log
```

