const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  // Super-Admins die das Admin-Panel nutzen dürfen (Discord-IDs)
  superAdmins: [String],

  // Gesperrte Nutzer (können sich nicht einloggen / keine Befehle nutzen)
  bannedUsers: [{
    discordId: String,
    username:  String,
    reason:    String,
    bannedAt:  { type: Date, default: Date.now },
    bannedBy:  String
  }],

  // Gesperrte Funktionen global
  disabledFeatures: [String],

  // Fehler-Reports von Nutzern
  errorReports: [{
    reportId:   { type: String, default: () => Math.random().toString(36).slice(2,10).toUpperCase() },
    userId:     String,
    username:   String,
    guildId:    String,
    message:    String,
    url:        String,
    stack:      String,
    status:     { type: String, enum: ['open','inProgress','resolved'], default: 'open' },
    createdAt:  { type: Date, default: Date.now }
  }]
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model('Admin', adminSchema);

