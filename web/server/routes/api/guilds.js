const express = require('express');
const path = require('path');
const router = express.Router();
const axios = require('axios');
const { Guild } = require('../../models');
const { isAuthenticated, isGuildAdmin, isTeamAdmin } = require('../../middleware/auth');

// Bot-API Basis-URL – aus .env oder Fallback
const BOT_API = () => process.env.BOT_API_URL || `http://127.0.0.1:${process.env.BOT_API_PORT || 3002}`;
const BOT_KEY = () => process.env.BOT_API_KEY || '';
const botHeaders = () => ({ 'x-api-key': BOT_KEY() });

// ── Alle Guilds des Users (Discord-Admin + Team-Mitglied) ─────
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.discordId;
    const MANAGE_GUILD = 0x20;
    const ADMINISTRATOR = 0x8;

    // Discord-Guilds des Users
    let discordGuilds = [];
    try {
      const resp = await axios.get('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${req.user.accessToken}` },
        timeout: 5000
      });
      discordGuilds = resp.data.filter(g => {
        const p = parseInt(g.permissions);
        return (p & ADMINISTRATOR) || (p & MANAGE_GUILD);
      }).map(g => ({
        id: g.id, name: g.name,
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
        source: 'discord'
      }));
    } catch (e) {
      console.warn('Discord API Fehler:', e.message);
    }

    // Team-Guilds aus DB wo User als teamMember eingetragen ist
    const teamGuilds = await Guild.find({ 'teamMembers.discordId': userId });
    const teamGuildsMapped = teamGuilds
      .filter(g => !discordGuilds.find(d => d.id === g.guildId)) // keine Duplikate
      .map(g => {
        const member = g.teamMembers.find(m => m.discordId === userId);
        return { id: g.guildId, name: g.name, icon: g.icon, source: 'team', teamRole: member?.role };
      });

    const allGuilds = [...discordGuilds, ...teamGuildsMapped];

    // Bot-Präsenz prüfen
    let botGuildIds = [];
    try {
      const botRes = await axios.get(`${BOT_API()}/guilds`,
        { headers: botHeaders(), timeout: 3000 }
      );
      botGuildIds = botRes.data.guildIds ?? [];
    } catch {
      const dbGuilds = await Guild.find({ guildId: { $in: allGuilds.map(g => g.id) } });
      botGuildIds = dbGuilds.map(g => g.guildId);
    }

    res.json(allGuilds.map(g => ({ ...g, botInServer: botGuildIds.includes(g.id) })));
  } catch (err) {
    console.error('Guilds Fehler:', err.message);
    res.status(500).json({ error: 'Konnte Guilds nicht laden.' });
  }
});

// ── Eine Guild + Config ────────────────────────────────────────
router.get('/:guildId', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId } = req.params;
    const mongoose = require('mongoose');
    const col = mongoose.connection.collection('guilds');

    let rawDoc = await col.findOne({ guildId });

    if (!rawDoc) {
      // Neu anlegen
      await Guild.create({
        guildId,
        name: req.userGuild?.name || guildId,
        icon: req.userGuild?.icon
          ? `https://cdn.discordapp.com/icons/${guildId}/${req.userGuild.icon}.png`
          : null
      });
      rawDoc = await col.findOne({ guildId });
    }

    // modules normalisieren: alte Boolean-Werte → { enabled: bool }
    const rawModules = rawDoc?.modules || {};
    const normalizedModules = {};
    for (const [key, val] of Object.entries(rawModules)) {
      if (typeof val === 'boolean') {
        normalizedModules[key] = { enabled: val };
      } else if (val && typeof val === 'object') {
        normalizedModules[key] = val;
      } else {
        normalizedModules[key] = { enabled: false };
      }
    }

    // plan normalisieren: alter String → Objekt
    let plan = rawDoc?.plan || { type: 'free' };
    if (typeof plan === 'string') plan = { type: plan };

    const guildData = {
      ...rawDoc,
      _id: rawDoc?._id,
      modules: normalizedModules,
      plan,
    };

    let botGuildInfo = null;
    try {
      const botRes = await axios.get(`${BOT_API()}/guilds/${guildId}`,
        { headers: botHeaders(), timeout: 3000 }
      );
      botGuildInfo = botRes.data;
    } catch (e) {
      console.warn('Bot API nicht erreichbar:', e.message);
    }

    res.json({
      guild: guildData,
      botInfo: botGuildInfo,
      teamRole: req.teamRole || 'admin',
      isTeamMember: req.isTeamMember || false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Guild-Config aktualisieren ─────────────────────────────────
router.patch('/:guildId', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId } = req.params;
    const guildData = await Guild.findOneAndUpdate(
      { guildId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, guild: guildData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Team-Mitglieder anzeigen ───────────────────────────────────
router.get('/:guildId/team', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const guildData = await Guild.findOne({ guildId: req.params.guildId });
    res.json({ team: guildData?.teamMembers || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Team-Mitglied hinzufügen (Discord-ID oder Username) ────────
router.post('/:guildId/team', isAuthenticated, isGuildAdmin, isTeamAdmin, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { discordId, username, role } = req.body;

    if (!discordId) return res.status(400).json({ error: 'discordId erforderlich.' });

    // Nutzer von Discord API holen (für Avatar+Username)
    let userInfo = { discordId, username: username || discordId, avatar: null };
    try {
      const resp = await axios.get(`https://discord.com/api/users/${discordId}`,
        { headers: { Authorization: `Bot ${process.env.BOT_TOKEN}` }, timeout: 3000 });
      userInfo = {
        discordId: resp.data.id,
        username: resp.data.username,
        avatar: resp.data.avatar
          ? `https://cdn.discordapp.com/avatars/${resp.data.id}/${resp.data.avatar}.png`
          : null
      };
    } catch { /* ignorieren */ }

    const guildData = await Guild.findOne({ guildId });
    const exists = guildData?.teamMembers?.find(m => m.discordId === discordId);
    if (exists) return res.status(409).json({ error: 'Nutzer ist bereits im Team.' });

    await Guild.updateOne(
      { guildId },
      { $push: { teamMembers: { ...userInfo, role: role || 'moderator', addedAt: new Date() } } }
    );

    res.json({ success: true, member: userInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Team-Mitglied entfernen ────────────────────────────────────
router.delete('/:guildId/team/:memberId', isAuthenticated, isGuildAdmin, isTeamAdmin, async (req, res) => {
  try {
    const { guildId, memberId } = req.params;
    await Guild.updateOne({ guildId }, { $pull: { teamMembers: { discordId: memberId } } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Team-Mitglied Rolle ändern ─────────────────────────────────
router.patch('/:guildId/team/:memberId', isAuthenticated, isGuildAdmin, isTeamAdmin, async (req, res) => {
  try {
    const { guildId, memberId } = req.params;
    const { role } = req.body;
    await Guild.updateOne(
      { guildId, 'teamMembers.discordId': memberId },
      { $set: { 'teamMembers.$.role': role } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

