# Discord Bot Dashboard

## Voraussetzungen
- Node.js v20+ (https://nodejs.org)
- MongoDB (https://www.mongodb.com/try/download/community) ODER MongoDB Atlas (kostenlos)
- Discord Developer Application (https://discord.com/developers/applications)

## Setup

### 1. Discord Bot erstellen
1. Gehe zu https://discord.com/developers/applications
2. Klicke "New Application"
3. Gehe zu "Bot" → "Add Bot"
4. Kopiere den **Token**
5. Gehe zu "OAuth2" → "General"
6. Kopiere die **Client ID** und das **Client Secret**
7. Füge folgende Redirect URI hinzu: `http://localhost:3001/auth/callback`

### 2. Umgebungsvariablen einrichten

```bash
cp .env.example bot/.env
cp .env.example web/.env
```

Fülle dann die `.env` Dateien aus (bot/.env und web/.env).

### 3. Abhängigkeiten installieren

```bash
npm run install:all
```

### 4. Bot-Commands registrieren

```bash
cd bot
npm run deploy
```

### 5. Starten

```bash
# Aus dem Root-Verzeichnis:
npm run dev
```

- **Webseite:** http://localhost:3001
- **Bot** läuft im Hintergrund

## Funktionen

### Moderationsmodul
- `/ban [user] [reason]` - User bannen
- `/kick [user] [reason]` - User kicken
- `/mute [user] [dauer] [reason]` - User timeouten
- `/unmute [user]` - Timeout aufheben
- `/warn [user] [reason]` - Verwarnung geben
- `/warnings [user]` - Verwarnungen anzeigen
- `/clearwarnings [user]` - Verwarnungen löschen
- `/purge [anzahl]` - Nachrichten löschen

### Leveling-System
- XP pro Nachricht (konfigurierbar)
- Level-Rollen automatisch vergeben
- `/rank` - Eigenen Rang anzeigen
- `/leaderboard` - Server-Rangliste

### Auto-Moderator
- Anti-Spam (Nachrichten-Rate)
- Anti-Links (URLs blockieren)
- Wort-Filter (verbotene Wörter)
- Caps-Filter (Großschreibung)
- Automatische Verwarnungen/Bans

### Willkommenssystem
- Willkommensnachricht in Channel
- Goodbye-Nachricht
- DM beim Beitreten
- Anpassbare Embeds

### Musik (optional)
- `/play [song]` - Musik abspielen
- `/skip` - Nächster Song
- `/queue` - Warteschlange
- `/pause` / `/resume`
- `/stop` - Stoppen

## Projektstruktur

```
Discordbot-web/
├── bot/                 # Discord Bot
│   ├── src/
│   │   ├── commands/   # Slash Commands
│   │   ├── events/     # Discord Events
│   │   ├── modules/    # Feature-Module
│   │   └── utils/      # Hilfsfunktionen
│   └── package.json
├── web/                 # Dashboard
│   ├── server/         # Express Backend
│   └── client/         # React Frontend
└── shared/             # Gemeinsame DB-Models
```

