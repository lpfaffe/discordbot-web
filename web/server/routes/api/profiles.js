const express = require('express');
const path = require('path');
const router = express.Router();
const { Guild, GuildProfile } = require('../../models');
const { isAuthenticated, isGuildAdmin } = require('../../middleware/auth');

// Alle Profile einer Guild abrufen
router.get('/:guildId', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId } = req.params;
    const profiles = await GuildProfile.find({ guildId }).sort({ createdAt: 1 });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Neues Profil erstellen
router.post('/:guildId', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId } = req.params;
    const { name, description, config } = req.body;

    if (!name) return res.status(400).json({ error: 'Name fehlt' });

    // Aktuelle Config als Basis verwenden wenn keine Config angegeben
    let profileConfig = config;
    if (!profileConfig) {
      const guildData = await Guild.findOne({ guildId });
      profileConfig = guildData?.modules || {};
    }

    const profile = await GuildProfile.create({
      guildId,
      name,
      description: description || '',
      isActive: false,
      config: profileConfig
    });

    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profil aktualisieren
router.patch('/:guildId/:profileId', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId, profileId } = req.params;
    const updates = req.body;

    const profile = await GuildProfile.findOneAndUpdate(
      { _id: profileId, guildId },
      { $set: updates },
      { new: true }
    );

    if (!profile) return res.status(404).json({ error: 'Profil nicht gefunden' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profil aktivieren (setzt isActive=true, alle anderen auf false)
router.post('/:guildId/:profileId/activate', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId, profileId } = req.params;

    const profile = await GuildProfile.findOne({ _id: profileId, guildId });
    if (!profile) return res.status(404).json({ error: 'Profil nicht gefunden' });

    // Alle anderen deaktivieren
    await GuildProfile.updateMany({ guildId }, { $set: { isActive: false } });
    await GuildProfile.findByIdAndUpdate(profileId, { $set: { isActive: true } });

    // Guild-Config mit Profil-Config überschreiben
    await Guild.findOneAndUpdate(
      { guildId },
      { $set: { modules: profile.config, activeProfileId: profile._id } }
    );

    res.json({ success: true, message: `Profil "${profile.name}" aktiviert` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Profil löschen
router.delete('/:guildId/:profileId', isAuthenticated, isGuildAdmin, async (req, res) => {
  try {
    const { guildId, profileId } = req.params;
    const profile = await GuildProfile.findOne({ _id: profileId, guildId });
    if (!profile) return res.status(404).json({ error: 'Profil nicht gefunden' });
    if (profile.isActive) return res.status(400).json({ error: 'Aktives Profil kann nicht gelöscht werden' });

    await profile.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

