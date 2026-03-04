const Guild = require('../../../shared/models/Guild');

// Invite-Cache pro Guild: Map<guildId, Map<code, uses>>
const inviteCache = new Map();

async function cacheInvites(guild) {
  try {
    const invites = await guild.invites.fetch();
    inviteCache.set(guild.id, new Map(invites.map(i => [i.code, i.uses])));
  } catch (e) {
    // Bot hat keine Berechtigung – ignorieren
  }
}

async function handleJoin(member) {
  try {
    const guildData = await Guild.findOne({ guildId: member.guild.id });
    const it = guildData?.modules?.inviteTracking;
    if (!it?.enabled) return;

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = inviteCache.get(member.guild.id) || new Map();

    // Invite mit erhöhter uses-Zahl finden
    const usedInvite = newInvites.find(i => {
      const oldUses = oldInvites.get(i.code) || 0;
      return i.uses > oldUses;
    });

    // Cache aktualisieren
    inviteCache.set(member.guild.id, new Map(newInvites.map(i => [i.code, i.uses])));

    const inviter = usedInvite?.inviter;
    const inviteCount = usedInvite ? usedInvite.uses : '?';

    if (it.channelId) {
      const channel = member.guild.channels.cache.get(it.channelId);
      if (channel) {
        const msg = (it.message || '{user} wurde von {inviter} eingeladen! ({inviter} hat jetzt {count} Einladungen)')
          .replace('{user}', `<@${member.id}>`)
          .replace(/\{inviter\}/g, inviter ? `<@${inviter.id}>` : 'Unbekannt')
          .replace('{count}', inviteCount);
        channel.send(msg).catch(console.error);
      }
    }
  } catch (e) {
    console.error('InviteTracking Fehler:', e);
  }
}

module.exports = { cacheInvites, handleJoin, inviteCache };

