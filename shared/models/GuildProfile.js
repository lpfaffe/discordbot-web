const mongoose = require('mongoose');

// Konfigurations-Profile: Jede Guild kann mehrere Profile haben
// Nur eines ist aktiv (isActive: true)
const guildProfileSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: false },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

guildProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index damit Abfragen nach guildId schnell sind
guildProfileSchema.index({ guildId: 1 });
guildProfileSchema.index({ guildId: 1, isActive: 1 });

module.exports = mongoose.model('GuildProfile', guildProfileSchema);

