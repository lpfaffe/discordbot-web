const mongoose = require('mongoose');

// Guild Model direkt mit web/node_modules mongoose – kein shared import
const Guild = mongoose.models.Guild || (() => {
  const s = new mongoose.Schema({
    guildId: String, name: String, icon: String,
    teamMembers: [{ discordId: String, role: String }]
  }, { strict: false, suppressReservedKeysWarning: true });
  return mongoose.model('Guild', s);
})();

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
    const guildData = await Guild.findOne({ guildId });
    if (guildData) {
      const tm = guildData.teamMembers && guildData.teamMembers.find(m => m.discordId === userId);
      if (tm) {
        req.userGuild = { id: guildId, name: guildData.name, icon: guildData.icon };
        req.teamRole = tm.role;
        req.isTeamMember = true;
        return next();
      }
    }
    const axios = require('axios');
    const resp = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: 'Bearer ' + req.user.accessToken },
      timeout: 5000
    });
    const guild = resp.data.find(g => g.id === guildId);
    if (!guild) return res.status(403).json({ error: 'Kein Zugriff.' });
    const perms = parseInt(guild.permissions);
    if (!(perms & 0x8) && !(perms & 0x20)) return res.status(403).json({ error: 'Keine Rechte.' });
    req.userGuild = guild; req.teamRole = 'admin'; req.isTeamMember = false;
    next();
  } catch (err) {
    console.error('GuildAdmin Fehler:', err.message);
    const gd = await Guild.findOne({ guildId }).catch(() => null);
    if (gd) { req.userGuild = { id: guildId, name: gd.name, icon: gd.icon }; req.teamRole = 'admin'; return next(); }
    return res.status(503).json({ error: 'Auth fehlgeschlagen.' });
  }
}
function isTeamAdmin(req, res, next) {
  if (req.teamRole === 'moderator' || req.teamRole === 'viewer')
    return res.status(403).json({ error: 'Admin-Rechte benoetigt.' });
  next();
}
module.exports = { isAuthenticated, isGuildAdmin, isTeamAdmin };
