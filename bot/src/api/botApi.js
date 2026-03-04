const express = require('express');
const app = express();

app.use(express.json());

// API Key Middleware
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (key !== process.env.BOT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Bot Status
app.get('/status', (req, res) => {
  const client = require('../index').client;
  res.json({
    status: 'online',
    uptime: process.uptime(),
    ping: client?.ws?.ping ?? -1,
    guildCount: client?.guilds?.cache?.size ?? 0,
    userCount: client?.guilds?.cache?.reduce((a, g) => a + g.memberCount, 0) ?? 0
  });
});

// Alle Guild-IDs auf denen der Bot ist
app.get('/guilds', (req, res) => {
  try {
    const client = require('../index').client;
    const guildIds = client?.guilds?.cache?.map(g => g.id) ?? [];
    res.json({ guildIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kanal-Typ Konstanten (Discord.js ChannelType)
// 0 = GuildText, 2 = GuildVoice, 4 = GuildCategory
// 5 = GuildAnnouncement, 13 = GuildStageVoice, 15 = GuildForum

// Guild-Info vom Bot holen – ALLE Kanäle und Kategorien
app.get('/guilds/:guildId', async (req, res) => {
  try {
    const client = require('../index').client;
    const guild = client?.guilds?.cache?.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });

    // Channels nach Position sortieren
    const allChannels = guild.channels.cache
      .sort((a, b) => {
        // Erst nach Kategorie-Position, dann nach Kanal-Position
        const catA = a.parentId ? guild.channels.cache.get(a.parentId)?.position ?? 0 : a.position ?? 0;
        const catB = b.parentId ? guild.channels.cache.get(b.parentId)?.position ?? 0 : b.position ?? 0;
        if (catA !== catB) return catA - catB;
        return (a.position ?? 0) - (b.position ?? 0);
      });

    // Kategorien (type 4)
    const categories = allChannels
      .filter(c => c.type === 4)
      .map(c => ({
        id: c.id,
        name: c.name,
        type: 4,
        position: c.position ?? 0
      }));

    // Text-Kanäle (type 0) + Announcement (type 5) + Forum (type 15)
    const textChannels = allChannels
      .filter(c => [0, 5, 15].includes(c.type))
      .map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        parentId: c.parentId ?? null,
        parentName: c.parent?.name ?? null,
        position: c.position ?? 0
      }));

    // Voice-Kanäle (type 2) + Stage (type 13)
    const voiceChannels = allChannels
      .filter(c => [2, 13].includes(c.type))
      .map(c => ({
        id: c.id,
        name: c.name,
        type: c.type,
        parentId: c.parentId ?? null,
        parentName: c.parent?.name ?? null,
        position: c.position ?? 0
      }));

    // Alle Kanäle zusammen (für Dropdowns die alle brauchen)
    const channels = [
      ...categories,
      ...textChannels,
      ...voiceChannels
    ];

    // Rollen – sortiert nach Position (hoch = wichtiger)
    const roles = guild.roles.cache
      .filter(r => r.id !== guild.id) // @everyone ausschließen
      .sort((a, b) => b.position - a.position)
      .map(r => ({
        id: r.id,
        name: r.name,
        color: r.hexColor,
        position: r.position,
        managed: r.managed,       // Bot-Rollen markieren
        mentionable: r.mentionable
      }));

    // Emojis
    const emojis = guild.emojis.cache.map(e => ({
      id: e.id,
      name: e.name,
      url: e.url,
      animated: e.animated
    }));

    res.json({
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 256 }),
      memberCount: guild.memberCount,
      boostLevel: guild.premiumTier,
      boostCount: guild.premiumSubscriptionCount,
      channels,       // alle Kanäle inkl. Kategorien
      categories,     // nur Kategorien
      textChannels,   // nur Text-Kanäle
      voiceChannels,  // nur Voice-Kanäle
      roles,
      emojis
    });
  } catch (err) {
    console.error('Bot API Guild-Fehler:', err);
    res.status(500).json({ error: err.message });
  }
});

// Einzelnen Kanal holen
app.get('/guilds/:guildId/channels/:channelId', (req, res) => {
  try {
    const client = require('../index').client;
    const guild = client?.guilds?.cache?.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    const channel = guild.channels.cache.get(req.params.channelId);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    res.json({ id: channel.id, name: channel.name, type: channel.type });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mitglieder-Liste (begrenzt)
app.get('/guilds/:guildId/members', async (req, res) => {
  try {
    const client = require('../index').client;
    const guild = client?.guilds?.cache?.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found' });
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    const members = await guild.members.fetch({ limit });
    res.json(members.map(m => ({
      id: m.id,
      username: m.user.username,
      displayName: m.displayName,
      avatar: m.user.displayAvatarURL({ size: 64 }),
      bot: m.user.bot,
      roles: m.roles.cache.filter(r => r.id !== guild.id).map(r => r.id)
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
