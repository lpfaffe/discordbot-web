/**
 * models.js – Zentrale Modell-Registrierung für web/server
 * Nutzt garantiert die web/node_modules/mongoose Instanz
 * damit keine Buffering-Timeouts entstehen.
 */
const mongoose = require('mongoose');

// ── User ─────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  discordId:     { type: String, required: true, unique: true },
  username:      { type: String, default: 'Unknown' },
  discriminator: { type: String, default: '0' },
  avatar:        { type: String, default: null },
  guilds:        [String],
  accessToken:   { type: String, default: null },
  refreshToken:  { type: String, default: null },
  tokenExpiry:   { type: Date,   default: null },
  xp:            { type: Map, of: Number, default: {} },
  level:         { type: Map, of: Number, default: {} },
  points:        { type: Map, of: Number, default: {} },
  credits:       { type: Number, default: 0 },
  bank:          { type: Number, default: 0 },
  lastDaily:     { type: Date, default: null },
  lastWork:      { type: Date, default: null },
  reputation:    { type: Number, default: 0 },
  lastRep:       { type: Date, default: null },
  birthday:      { day: { type: Number, default: null }, month: { type: Number, default: null } },
  plan:          { type: String, default: 'free' },
  isBanned:      { type: Boolean, default: false },
  banReason:     { type: String, default: null },
  createdAt:     { type: Date, default: Date.now },
  updatedAt:     { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });
userSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

// ── Guild ────────────────────────────────────────────────────
const guildSchema = new mongoose.Schema({
  guildId:  { type: String, required: true, unique: true },
  name:     { type: String, default: '' },
  icon:     { type: String, default: null },
  plan:     { type: String, default: 'free', enum: ['free','basic','standard','pro'] },
  teamMembers: [{
    discordId: String,
    username:  String,
    role:      { type: String, enum: ['admin','moderator','viewer'], default: 'viewer' }
  }],
  modules: { type: Map, of: Boolean, default: {} },
  settings: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });
guildSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

// ── GuildProfile ─────────────────────────────────────────────
const guildProfileSchema = new mongoose.Schema({
  guildId:  { type: String, required: true },
  userId:   { type: String, required: true },
  xp:       { type: Number, default: 0 },
  level:    { type: Number, default: 0 },
  points:   { type: Number, default: 0 },
  warnings: { type: Number, default: 0 }
}, { suppressReservedKeysWarning: true });

// ── Warning ──────────────────────────────────────────────────
const warningSchema = new mongoose.Schema({
  guildId:     { type: String, required: true },
  userId:      { type: String, required: true },
  moderatorId: { type: String, required: true },
  reason:      { type: String, default: 'Kein Grund angegeben' },
  createdAt:   { type: Date, default: Date.now }
});

// ── Admin ────────────────────────────────────────────────────
const adminSchema = new mongoose.Schema({
  superAdmins: [String],
  bannedUsers: [{
    discordId: String,
    username:  String,
    reason:    String,
    bannedAt:  { type: Date, default: Date.now }
  }],
  errorReports: [{
    reportId:  String,
    userId:    String,
    username:  String,
    guildId:   String,
    message:   String,
    url:       String,
    stack:     String,
    status:    { type: String, default: 'open' },
    createdAt: { type: Date, default: Date.now }
  }],
  announcements: [{ message: String, createdAt: { type: Date, default: Date.now } }]
});

// Modelle registrieren (nur einmal)
const User         = mongoose.models.User         || mongoose.model('User',         userSchema);
const Guild        = mongoose.models.Guild        || mongoose.model('Guild',        guildSchema);
const GuildProfile = mongoose.models.GuildProfile || mongoose.model('GuildProfile', guildProfileSchema);
const Warning      = mongoose.models.Warning      || mongoose.model('Warning',      warningSchema);
const Admin        = mongoose.models.Admin        || mongoose.model('Admin',        adminSchema);

module.exports = { User, Guild, GuildProfile, Warning, Admin };

