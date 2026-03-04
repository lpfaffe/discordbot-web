/**
 * dbHelper.js – Hilfsfunktionen für nativen MongoDB-Zugriff im Bot
 * Nutzt mongoose.connection direkt um Schema-Einschränkungen zu umgehen
 */
const mongoose = require('mongoose');

/**
 * Liest die komplette Guild-Config aus MongoDB (nativ, kein Mongoose-Schema)
 * @param {string} guildId
 * @returns {object|null}
 */
async function getGuildDoc(guildId) {
  const col = mongoose.connection.collection('guilds');
  return await col.findOne({ guildId });
}

/**
 * Liest ein einzelnes Modul aus der Guild-Config
 * @param {string} guildId
 * @param {string} moduleName
 * @returns {{ enabled: boolean, ...config }|null}
 */
async function getModuleConfig(guildId, moduleName) {
  const doc = await getGuildDoc(guildId);
  const raw = doc?.modules?.[moduleName];
  if (!raw) return null;
  // Altes Boolean-Format normalisieren
  if (typeof raw === 'boolean') return { enabled: raw };
  return raw;
}

/**
 * Prüft ob ein Modul aktiviert ist
 * @param {string} guildId
 * @param {string} moduleName
 * @returns {boolean}
 */
async function isModuleEnabled(guildId, moduleName) {
  const cfg = await getModuleConfig(guildId, moduleName);
  return cfg?.enabled === true;
}

module.exports = { getGuildDoc, getModuleConfig, isModuleEnabled };

