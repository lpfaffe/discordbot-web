const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  discordId:     { type: String, required: true, unique: true },
  username:      { type: String, default: 'Unknown' },
  discriminator: { type: String, default: '0' },
  avatar:        { type: String, default: null },
  guilds:        [String],

  // Auth
  accessToken:  { type: String, default: null },
  refreshToken: { type: String, default: null },
  tokenExpiry:  { type: Date,   default: null },

  // XP / Level pro Guild  { guildId: value }
  xp:    { type: Map, of: Number, default: {} },
  level: { type: Map, of: Number, default: {} },

  // Punkte pro Guild (von Moderatoren vergeben)
  points: { type: Map, of: Number, default: {} },

  // Economy
  credits:    { type: Number, default: 0 },
  bank:       { type: Number, default: 0 },
  lastDaily:  { type: Date,   default: null },
  lastWork:   { type: Date,   default: null },

  // Reputation
  reputation: { type: Number, default: 0 },
  lastRep:    { type: Date,   default: null },

  // Geburtstag
  birthday: {
    day:   { type: Number, default: null },
    month: { type: Number, default: null }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

userSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('User', userSchema);



