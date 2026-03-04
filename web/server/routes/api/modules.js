const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Guild } = require('../../models');
const { isAuthenticated, isGuildAdmin } = require('../../middleware/auth');

const VALID_MODULES = [
  'moderation', 'leveling', 'automod', 'welcome', 'welcomeChannel',
  'music', 'tickets', 'reactionRoles', 'economy', 'giveaways',
  'birthdays', 'starboard', 'customCommands', 'inviteTracking',
  'polls', 'reminders', 'tempChannels', 'statChannels',
  'notifications', 'achievements', 'automations', 'embedBuilder',
  'search', 'musicQuiz', 'crypto', 'gating', 'monetization', 'utility'
];

// Hilfsfunktion: rohe modules-Map aus DB holen (native, umgeht Schema)
async function getRawModules(guildId) {
  const col = mongoose.connection.collection('guilds');
  const doc = await col.findOne({ guildId });
  return doc?.modules || {};
}

// Modul-Status abrufen
router.get('/:guildId/:module', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId, module } = req.params;
    if (!VALID_MODULES.includes(module))
      return res.status(400).json({ error: `Unbekanntes Modul: "${module}"` });

    const rawModules = await getRawModules(guildId);
    const moduleData = rawModules[module];

    // Altes Boolean-Format normalisieren
    let config;
    if (moduleData === undefined || moduleData === null) {
      config = { enabled: false };
    } else if (typeof moduleData === 'boolean') {
      config = { enabled: moduleData };
    } else {
      config = moduleData;
    }

    res.json({ module, config });
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

    const col = mongoose.connection.collection('guilds');

    // Aktuellen Zustand holen
    const doc = await col.findOne({ guildId });
    const rawModules = doc?.modules || {};
    const current = rawModules[module];

    // Altes Boolean-Format in Objekt umwandeln
    let existing = {};
    if (typeof current === 'boolean') {
      existing = { enabled: current };
    } else if (current && typeof current === 'object') {
      existing = current;
    }

    // Neue Werte mergen (dot-notation auflösen)
    const merged = { ...existing };
    for (const [key, value] of Object.entries(updates)) {
      // dot-notation: 'autoAction.warnThreshold' → nested
      const parts = key.split('.');
      if (parts.length === 1) {
        merged[key] = value;
      } else {
        let obj = merged;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!obj[parts[i]] || typeof obj[parts[i]] !== 'object') obj[parts[i]] = {};
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
      }
    }

    // Nativ speichern – umgeht Mongoose-Schema-Einschränkungen
    await col.updateOne(
      { guildId },
      { $set: { [`modules.${module}`]: merged } },
      { upsert: true }
    );

    res.json({ success: true, module, config: merged });
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

    const col = mongoose.connection.collection('guilds');
    const doc = await col.findOne({ guildId });
    const rawModules = doc?.modules || {};
    const current = rawModules[module];

    // Altes Boolean-Format oder Objekt
    let existing = {};
    if (typeof current === 'boolean') {
      existing = { enabled: current };
    } else if (current && typeof current === 'object') {
      existing = { ...current };
    }

    const newEnabled = !(existing.enabled ?? false);
    existing.enabled = newEnabled;

    await col.updateOne(
      { guildId },
      { $set: { [`modules.${module}`]: existing } },
      { upsert: true }
    );

    res.json({ success: true, module, enabled: newEnabled });
  } catch (err) {
    console.error('Module toggle Fehler:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
