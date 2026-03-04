const express = require('express');
const path = require('path');
const router = express.Router();
const { Guild } = require('../../models');
const { isAuthenticated, isGuildAdmin } = require('../../middleware/auth');

// Alle erlaubten Module
const VALID_MODULES = [
  'moderation', 'leveling', 'automod', 'welcome', 'welcomeChannel',
  'music', 'tickets', 'reactionRoles', 'economy', 'giveaways',
  'birthdays', 'starboard', 'customCommands', 'inviteTracking',
  'polls', 'reminders', 'tempChannels', 'statChannels',
  'notifications', 'achievements', 'automations', 'embedBuilder',
  'search', 'musicQuiz', 'crypto', 'gating', 'monetization', 'utility'
];

// Modul-Status abrufen
router.get('/:guildId/:module', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId, module } = req.params;

    if (!VALID_MODULES.includes(module))
      return res.status(400).json({ error: `Unbekanntes Modul: "${module}"` });

    let guildData = await Guild.findOne({ guildId });
    if (!guildData) {
      guildData = await Guild.create({ guildId, name: req.userGuild?.name || guildId });
    }

    const moduleData = guildData.modules?.[module] || { enabled: false };
    res.json({ module, config: moduleData });
  } catch (err) {
    console.error('Module GET Fehler:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Modul-Config speichern
router.patch('/:guildId/:module', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId, module } = req.params;
    const updates = req.body;

    if (!VALID_MODULES.includes(module))
      return res.status(400).json({ error: `Unbekanntes Modul: "${module}"` });

    // Nested update mit dot-notation
    const setObj = {};
    for (const [key, value] of Object.entries(updates)) {
      setObj[`modules.${module}.${key}`] = value;
    }

    const guildData = await Guild.findOneAndUpdate(
      { guildId },
      { $set: setObj },
      { new: true, upsert: true }
    );

    res.json({ success: true, module, config: guildData.modules?.[module] });
  } catch (err) {
    console.error('Module PATCH Fehler:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Modul aktivieren/deaktivieren
router.post('/:guildId/:module/toggle', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId, module } = req.params;

    if (!VALID_MODULES.includes(module))
      return res.status(400).json({ error: `Unbekanntes Modul: "${module}"` });

    let guildData = await Guild.findOne({ guildId });
    if (!guildData) {
      guildData = await Guild.create({ guildId, name: req.userGuild?.name || guildId });
    }

    const currentEnabled = guildData.modules?.[module]?.enabled ?? false;
    await Guild.findOneAndUpdate(
      { guildId },
      { $set: { [`modules.${module}.enabled`]: !currentEnabled } },
      { upsert: true }
    );

    res.json({ success: true, module, enabled: !currentEnabled });
  } catch (err) {
    console.error('Module toggle Fehler:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
