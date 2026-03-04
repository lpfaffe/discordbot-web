const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  reason: { type: String, default: 'Kein Grund angegeben' },
  type: { type: String, enum: ['warn', 'mute', 'ban', 'kick', 'tempban'], default: 'warn' },
  duration: { type: Number, default: null },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null }
});

warningSchema.index({ guildId: 1, userId: 1 });

module.exports = mongoose.model('Warning', warningSchema);

