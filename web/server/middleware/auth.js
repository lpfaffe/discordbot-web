const mongoose = require('mongoose');
const axios = require('axios');

// Guild Model
const Guild = mongoose.models.Guild || (() => {
  const s = new mongoose.Schema({
    guildId: String, name: String, icon: String,
    teamMembers: [{ discordId: String, role: String }]
  }, { strict: false, suppressReservedKeysWarning: true });
  return mongoose.model('Guild', s);
})();

// In-Memory Cache für Discord-Guild-Listen (pro User, 60s TTL)
const guildCache = new Map(); // userId → { guilds, expiresAt }
const CACHE_TTL = 60_000; // 60 Sekunden

async function getDiscordGuilds(userId, accessToken) {
  const cached = guildCache.get(userId);
  if (cached && Date.now() < cached.expiresAt) return cached.guilds;

  const resp = await axios.get('https://discord.com/api/users/@me/guilds', {
    headers: { Authorization: 'Bearer ' + accessToken },
    timeout: 5000
  });
  const guilds = resp.data;
  guildCache.set(userId, { guilds, expiresAt: Date.now() + CACHE_TTL });
  return guilds;
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Nicht authentifiziert.' });
}

async function isGuildAdmin(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Nicht authentifiziert.' });
  const { guildId } = req.params;
  if (!guildId) return res.status(400).json({ error: 'Keine Guild-ID.' });
  const userId = req.user.discordId;

  try {
    // 1. Team-Mitglied in DB? → direkt durchlassen (kein Discord-API-Call nötig)
    const guildData = await Guild.findOne({ guildId });
    if (guildData) {
      const tm = guildData.teamMembers?.find(m => m.discordId === userId);
      if (tm) {
        req.userGuild = { id: guildId, name: guildData.name, icon: guildData.icon };
        req.teamRole = tm.role;
        req.isTeamMember = true;
        return next();
      }
    }

    // 2. Discord-API mit Cache prüfen
    let guilds;
    try {
      guilds = await getDiscordGuilds(userId, req.user.accessToken);
    } catch (discordErr) {
      console.error('GuildAdmin Fehler:', discordErr.message);
      // Bei 429 oder Netzwerkfehler: DB-Fallback
      if (guildData) {
        req.userGuild = { id: guildId, name: guildData.name, icon: guildData.icon };
        req.teamRole = 'admin';
        req.isTeamMember = false;
        return next();
      }
      // Bei 429: kurz warten und weiterleiten statt 503
      if (discordErr.response?.status === 429) {
        req.userGuild = { id: guildId, name: guildId };
        req.teamRole = 'admin';
        return next();
      }
      return res.status(503).json({ error: 'Auth fehlgeschlagen (Discord nicht erreichbar).' });
    }

    const guild = guilds.find(g => g.id === guildId);
    if (!guild) return res.status(403).json({ error: 'Kein Zugriff auf diesen Server.' });

    const perms = parseInt(guild.permissions);
    if (!(perms & 0x8) && !(perms & 0x20))
      return res.status(403).json({ error: 'Keine Verwaltungsrechte.' });

    req.userGuild = guild;
    req.teamRole = 'admin';
    req.isTeamMember = false;
    next();
  } catch (err) {
    console.error('GuildAdmin Fehler:', err.message);
    // Letzter Fallback: wenn Guild in DB → durchlassen
    const gd = await Guild.findOne({ guildId }).catch(() => null);
    if (gd) {
      req.userGuild = { id: guildId, name: gd.name, icon: gd.icon };
      req.teamRole = 'admin';
      return next();
    }
    return res.status(503).json({ error: 'Auth fehlgeschlagen.' });
  }
}

function isTeamAdmin(req, res, next) {
  if (req.teamRole === 'moderator' || req.teamRole === 'viewer')
    return res.status(403).json({ error: 'Admin-Rechte benötigt.' });
  next();
}

module.exports = { isAuthenticated, isGuildAdmin, isTeamAdmin };
