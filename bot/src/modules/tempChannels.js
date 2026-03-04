/**
 * tempChannels.js – Zentrales Modul für temporäre Voice-Kanäle
 * Exportiert die tempChannelMap damit voiceStateUpdate und voice-Commands sie teilen
 */

// userId → channelId  (global pro Bot-Instanz)
const tempChannelMap = new Map();

/**
 * Prüft ob ein Channel ein temp-Kanal ist
 * @param {string} channelId
 * @returns {string|null} ownerId oder null
 */
function getOwner(channelId) {
  for (const [uid, cid] of tempChannelMap) {
    if (cid === channelId) return uid;
  }
  return null;
}

/**
 * Löscht einen Eintrag aus der Map (wenn Kanal gelöscht wird)
 * @param {string} channelId
 */
function removeChannel(channelId) {
  for (const [uid, cid] of tempChannelMap) {
    if (cid === channelId) { tempChannelMap.delete(uid); return; }
  }
}

module.exports = { tempChannelMap, getOwner, removeChannel };

