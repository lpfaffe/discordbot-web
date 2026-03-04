module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    console.log(`âœ… Bot eingeloggt als ${client.user.tag}`);
    console.log(`ðŸ“Š Verbunden mit ${client.guilds.cache.size} Server(n)`);

    const Guild = require('../models').Guild;
    const inviteTracking = require('../modules/inviteTracking');

    // â”€â”€ Guilds synchronisieren + Invite-Cache â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    for (const [, guild] of client.guilds.cache) {
      await Guild.findOneAndUpdate(
        { guildId: guild.id },
        { guildId: guild.id, name: guild.name, icon: guild.iconURL() },
        { upsert: true, new: true }
      );
      await inviteTracking.cacheInvites(guild);
    }
    console.log('âœ… Guilds synchronisiert');

    // â”€â”€ Rotierende Presence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const getActivities = () => [
      { name: `${client.guilds.cache.size} Server`,         type: 3 },  // Watching
      { name: `/help | ${client.guilds.cache.size} Server`, type: 0 },  // Playing
      { name: `${client.users.cache.size} Nutzer`,          type: 3 },  // Watching
      { name: 'Dashboard: localhost:3001',                   type: 2 },  // Listening
      { name: `Ping: ${client.ws.ping}ms`,                  type: 0 },  // Playing
      { name: '/help fÃ¼r Hilfe',                             type: 0 },  // Playing
    ]

    let actIdx = 0
    const rotatePresence = () => {
      const activities = getActivities()
      actIdx = (actIdx + 1) % activities.length
      client.user.setPresence({
        activities: [activities[actIdx]],
        status: 'online'
      })
    }

    // Sofort setzen, dann alle 30 Sekunden wechseln
    client.user.setPresence({ activities: [{ name: `${client.guilds.cache.size} Server`, type: 3 }], status: 'online' })
    setInterval(rotatePresence, 30000)

    // â”€â”€ Reminder-Loop (60s) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    setInterval(async () => {
      try {
        const guilds = await Guild.find({ 'modules.reminders.enabled': true });
        for (const g of guilds) {
          const items = g.modules.reminders?.items || [];
          let changed = false;
          for (const item of items) {
            if (!item.active || !item.channelId || !item.interval) continue;
            const now = new Date();
            const last = item.lastSent ? new Date(item.lastSent) : new Date(0);
            if (now - last >= item.interval) {
              const guild = client.guilds.cache.get(g.guildId);
              const channel = guild?.channels.cache.get(item.channelId);
              if (channel) { channel.send(item.message).catch(console.error); item.lastSent = now; changed = true; }
            }
          }
          if (changed) await g.save();
        }
      } catch (e) { console.error('Reminder Fehler:', e); }
    }, 60000);

    // â”€â”€ Geburtstags-Check (tÃ¤glich) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const checkBirthdays = async () => {
      try {
        const User = require('../models').User;
        const now = new Date();
        const users = await User.find({ 'birthday.day': now.getDate(), 'birthday.month': now.getMonth() + 1 });
        for (const user of users) {
          for (const [, guild] of client.guilds.cache) {
            const guildData = await Guild.findOne({ guildId: guild.id });
            const bd = guildData?.modules?.birthdays;
            if (!bd?.enabled || !bd.channelId) continue;
            const member = await guild.members.fetch(user.discordId).catch(() => null);
            if (!member) continue;
            const channel = guild.channels.cache.get(bd.channelId);
            if (channel) channel.send((bd.message || 'ðŸŽ‚ Alles Gute {user}!').replace('{user}', `<@${user.discordId}>`)).catch(console.error);
            if (bd.roleId) {
              const role = guild.roles.cache.get(bd.roleId);
              if (role) { member.roles.add(role).catch(console.error); setTimeout(() => member.roles.remove(role).catch(console.error), 86400000); }
            }
          }
        }
      } catch (e) { console.error('Birthday Fehler:', e); }
    };
    checkBirthdays();
    setInterval(checkBirthdays, 86400000);

    // â”€â”€ Statistik-KanÃ¤le (10 Min) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    setInterval(async () => {
      try {
        const guilds = await Guild.find({ 'modules.statChannels.enabled': true });
        for (const g of guilds) {
          const guild = client.guilds.cache.get(g.guildId);
          if (!guild) continue;
          for (const sc of (g.modules.statChannels?.channels || [])) {
            const channel = guild.channels.cache.get(sc.channelId);
            if (!channel) continue;
            let value = '';
            if (sc.type === 'members') value = guild.memberCount;
            else if (sc.type === 'online') value = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
            else if (sc.type === 'bots') value = guild.members.cache.filter(m => m.user.bot).size;
            else if (sc.type === 'channels') value = guild.channels.cache.size;
            else if (sc.type === 'roles') value = guild.roles.cache.size;
            const newName = (sc.name || '{value}').replace('{value}', value);
            if (channel.name !== newName) channel.setName(newName).catch(console.error);
          }
        }
      } catch (e) { console.error('StatChannel Fehler:', e); }
    }, 600000);
  }
};
