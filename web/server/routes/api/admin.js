const express = require('express');
const path = require('path');
const router = express.Router();
const { Admin, Guild, User } = require('../../models');
const { isAuthenticated } = require('../../middleware/auth');

// Super-Admin prüfen
async function isSuperAdmin(req, res, next) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Nicht eingeloggt.' });
  const doc = await Admin.findOne({});
  const admins = doc?.superAdmins || [];
  // Wenn keine Admins konfiguriert: ersten User als Admin zulassen (Bootstrap)
  if (admins.length === 0 || admins.includes(req.user.discordId)) return next();
  return res.status(403).json({ error: 'Kein Super-Admin.' });
}

// ── Admin-Status prüfen ────────────────────────────────────────
router.get('/me', isAuthenticated, async (req, res) => {
  const doc = await Admin.findOne({});
  const admins = doc?.superAdmins || [];
  const isAdmin = admins.length === 0 || admins.includes(req.user.discordId);
  res.json({ isAdmin, discordId: req.user.discordId });
});

// ── Super-Admin hinzufügen ─────────────────────────────────────
router.post('/admins', isAuthenticated, isSuperAdmin, async (req, res) => {
  const { discordId } = req.body;
  if (!discordId) return res.status(400).json({ error: 'discordId erforderlich.' });
  await Admin.findOneAndUpdate({}, { $addToSet: { superAdmins: discordId } }, { upsert: true });
  res.json({ success: true });
});

router.delete('/admins/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
  await Admin.findOneAndUpdate({}, { $pull: { superAdmins: req.params.id } });
  res.json({ success: true });
});

router.get('/admins', isAuthenticated, isSuperAdmin, async (req, res) => {
  const doc = await Admin.findOne({});
  res.json({ admins: doc?.superAdmins || [] });
});

// ── Nutzer sperren/entsperren ──────────────────────────────────
router.get('/banned', isAuthenticated, isSuperAdmin, async (req, res) => {
  const doc = await Admin.findOne({});
  res.json({ banned: doc?.bannedUsers || [] });
});

router.post('/banned', isAuthenticated, isSuperAdmin, async (req, res) => {
  const { discordId, username, reason } = req.body;
  if (!discordId) return res.status(400).json({ error: 'discordId erforderlich.' });
  await Admin.findOneAndUpdate({}, {
    $push: { bannedUsers: { discordId, username: username || discordId, reason: reason || 'Kein Grund', bannedBy: req.user.discordId } }
  }, { upsert: true });
  res.json({ success: true });
});

router.delete('/banned/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
  await Admin.findOneAndUpdate({}, { $pull: { bannedUsers: { discordId: req.params.id } } });
  res.json({ success: true });
});

// ── Plan-System ────────────────────────────────────────────────
router.get('/plan/:guildId', isAuthenticated, isSuperAdmin, async (req, res) => {
  const guild = await Guild.findOne({ guildId: req.params.guildId });
  res.json({ plan: guild?.plan || { type: 'free' } });
});

router.patch('/plan/:guildId', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { type, expiresAt } = req.body;
    const valid = ['free', 'basic', 'standard', 'pro'];
    if (!valid.includes(type)) return res.status(400).json({ error: 'Ungültiger Plan.' });

    const guildId = req.params.guildId;
    const mongoose = require('mongoose');
    const collection = mongoose.connection.collection('guilds');

    // Direkt mit nativem Treiber arbeiten – umgeht Mongoose-Schema-Validierung
    // und kann auch String-Felder durch Objekte ersetzen
    await collection.updateOne(
      { guildId },
      {
        $set: {
          plan: {
            type,
            expiresAt: expiresAt || null,
            setBy: req.user.discordId,
            setAt: new Date()
          }
        }
      },
      { upsert: true }
    );

    res.json({ success: true, plan: { type, expiresAt: expiresAt || null } });
  } catch (err) {
    console.error('Plan setzen Fehler:', err);
    res.status(500).json({ error: 'Interner Fehler: ' + err.message });
  }
});

// Alle Guilds mit Plänen anzeigen
router.get('/plans', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const guilds = await Guild.find({}, 'guildId name icon plan teamMembers').lean();
    // Altes String-Format normalisieren
    const normalized = guilds.map(g => ({
      ...g,
      plan: typeof g.plan === 'string'
        ? { type: g.plan || 'free', expiresAt: null, setBy: null, setAt: null }
        : (g.plan || { type: 'free' })
    }));
    res.json({ guilds: normalized });
  } catch (err) {
    console.error('Plans laden Fehler:', err);
    res.status(500).json({ error: 'Interner Fehler: ' + err.message });
  }
});

// ── Fehler-Reports ─────────────────────────────────────────────
router.get('/reports', isAuthenticated, isSuperAdmin, async (req, res) => {
  const doc = await Admin.findOne({});
  const reports = (doc?.errorReports || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ reports });
});

router.patch('/reports/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
  const { status } = req.body;
  await Admin.findOneAndUpdate(
    { 'errorReports.reportId': req.params.id },
    { $set: { 'errorReports.$.status': status } }
  );
  res.json({ success: true });
});

router.delete('/reports/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
  await Admin.findOneAndUpdate({}, { $pull: { errorReports: { reportId: req.params.id } } });
  res.json({ success: true });
});

// ── Fehler-Report einreichen (für alle Nutzer) ─────────────────
router.post('/reports', isAuthenticated, async (req, res) => {
  const { message, url, stack, guildId } = req.body;
  if (!message) return res.status(400).json({ error: 'Nachricht erforderlich.' });
  const reportId = Math.random().toString(36).slice(2,10).toUpperCase();
  await Admin.findOneAndUpdate({}, {
    $push: { errorReports: {
      reportId,
      userId:   req.user.discordId,
      username: req.user.username,
      guildId:  guildId || null,
      message, url: url || '', stack: stack || '',
      status: 'open',
      createdAt: new Date()
    }}
  }, { upsert: true });
  res.json({ success: true, reportId });
});

// ── Statistiken ────────────────────────────────────────────────
router.get('/stats', isAuthenticated, isSuperAdmin, async (req, res) => {
  const [guilds, users, admin] = await Promise.all([
    Guild.countDocuments(),
    User.countDocuments(),
    Admin.findOne({})
  ]);
  // plan.type kann ein Objekt oder ein String sein (Kompatibilität)
  const planCounts = await Guild.aggregate([
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: [{ $type: '$plan' }, 'string'] },
            then: '$plan',
            else: '$plan.type'
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);
  res.json({
    guilds, users,
    bannedUsers:  admin?.bannedUsers?.length  || 0,
    openReports:  admin?.errorReports?.filter(r => r.status === 'open').length || 0,
    plans: Object.fromEntries(planCounts.map(p => [p._id || 'free', p.count]))
  });
});

module.exports = router;

