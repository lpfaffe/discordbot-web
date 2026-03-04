const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  moderatorId: { type: String, required: true },
  reason: { type: String, default: 'Kein Grund angegeben' },
  type: { type: String, enum: ['warn', 'mute', 'ban', 'kick'], default: 'warn' },
  createdAt: { type: Date, default: Date.now }
});

const guildSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  icon: { type: String, default: null },
  activeProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'GuildProfile', default: null },

  // Team-Mitglieder die Dashboard-Zugriff haben (Discord-User-IDs)
  teamMembers: [{
    discordId: String,
    username:  String,
    avatar:    String,
    role:      { type: String, enum: ['admin', 'moderator', 'viewer'], default: 'moderator' },
    addedAt:   { type: Date, default: Date.now }
  }],

  // Abonnement-Plan
  plan: {
    type:      { type: String, enum: ['free', 'basic', 'standard', 'pro'], default: 'free' },
    expiresAt: { type: Date, default: null },
    setBy:     { type: String, default: null }, // Discord-ID des Admins der den Plan gesetzt hat
    setAt:     { type: Date, default: Date.now }
  },

  modules: {
    moderation: {
      enabled: { type: Boolean, default: false },
      logChannelId: { type: String, default: null },
      muteRoleId: { type: String, default: null },
      autoAction: {
        warnThreshold: { type: Number, default: 3 },
        action: { type: String, enum: ['kick', 'ban', 'mute'], default: 'kick' }
      },
      commands: {
        ban:           { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        kick:          { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        mute:          { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        unmute:        { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        warn:          { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        warnings:      { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        clearwarnings: { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        purge:         { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        slowmode:      { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        lock:          { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        unlock:        { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } },
        timeout:       { enabled: { type: Boolean, default: true }, logChannelId: { type: String, default: null }, allowedRoleId: { type: String, default: null } }
      }
    },
    leveling: {
      enabled: { type: Boolean, default: false },
      xpPerMessage: { type: Number, default: 15, min: 1, max: 100 },
      xpCooldown: { type: Number, default: 60 },
      levelUpChannelId: { type: String, default: null },
      levelUpMessage: { type: String, default: 'Glückwunsch {user}! Du bist auf Level {level} aufgestiegen!' },
      levelRoles: [{
        level: Number,
        roleId: String
      }],
      ignoredChannels: [String],
      ignoredRoles: [String]
    },
    automod: {
      enabled: { type: Boolean, default: false },
      antiSpam: {
        enabled: { type: Boolean, default: false },
        maxMessages: { type: Number, default: 5 },
        timeWindow: { type: Number, default: 5000 },
        action: { type: String, enum: ['warn', 'mute', 'kick', 'ban'], default: 'warn' }
      },
      antiLinks: {
        enabled: { type: Boolean, default: false },
        whitelist: [String],
        action: { type: String, enum: ['delete', 'warn', 'mute'], default: 'delete' }
      },
      wordFilter: {
        enabled: { type: Boolean, default: false },
        words: [String],
        action: { type: String, enum: ['delete', 'warn', 'mute'], default: 'delete' }
      },
      capsFilter: {
        enabled: { type: Boolean, default: false },
        threshold: { type: Number, default: 70 },
        minLength: { type: Number, default: 10 },
        action: { type: String, enum: ['delete', 'warn'], default: 'delete' }
      },
      ignoredChannels: [String],
      ignoredRoles: [String]
    },
    welcome: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      message: { type: String, default: 'Willkommen {user} auf {server}! Du bist Mitglied #{count}.' },
      useEmbed: { type: Boolean, default: false },
      embedColor: { type: String, default: '#5865F2' },
      embedTitle: { type: String, default: 'Willkommen!' },
      embedDescription: { type: String, default: 'Herzlich Willkommen auf unserem Server, {user}!' },
      goodbye: {
        enabled: { type: Boolean, default: false },
        channelId: { type: String, default: null },
        message: { type: String, default: '{user} hat den Server verlassen.' }
      },
      dm: {
        enabled: { type: Boolean, default: false },
        message: { type: String, default: 'Willkommen auf {server}! Schön, dass du da bist.' }
      },
      autoRole: {
        enabled: { type: Boolean, default: false },
        roleId: { type: String, default: null }
      }
    },
    welcomeChannel: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      description: { type: String, default: 'Willkommen auf unserem Server!' },
      rules: { type: String, default: '' },
      showMemberCount: { type: Boolean, default: true }
    },
    monetization: {
      enabled: { type: Boolean, default: false },
      stripeKey: { type: String, default: null },
      subscriptionRoleId: { type: String, default: null },
      subscriptionChannelId: { type: String, default: null }
    },
    music: {
      enabled: { type: Boolean, default: false },
      djRoleId: { type: String, default: null },
      defaultVolume: { type: Number, default: 50, min: 0, max: 100 },
      maxQueueSize: { type: Number, default: 100 }
    },
    tickets: {
      enabled: { type: Boolean, default: false },
      categoryId: { type: String, default: null },
      supportRoleId: { type: String, default: null },
      logChannelId: { type: String, default: null },
      message: { type: String, default: 'Hallo {user}! Das Support-Team wird sich bald melden.' },
      channelId: { type: String, default: null },
      maxTickets: { type: Number, default: 1 },
      ratingEnabled: { type: Boolean, default: false },
      dmOnClose: { type: Boolean, default: true },
      panels: [{
        name: { type: String, default: 'Support Panel' },
        title: { type: String, default: '🎫 Support-Tickets' },
        description: { type: String, default: 'Klicke auf einen Button um ein Ticket zu erstellen.' },
        color: { type: String, default: '#5865F2' },
        footer: { type: String, default: 'Support-System' },
        image: { type: String, default: null },
        types: [{
          id: String,
          label: String,
          emoji: { type: String, default: '🎫' },
          description: String,
          prefix: String,
          categoryId: String,
          extraRoleId: String,
          message: String,
          color: { type: String, default: '#5865F2' }
        }]
      }]
    },
    reactionRoles: {
      enabled: { type: Boolean, default: false },
      menus: [{
        messageId: String,
        channelId: String,
        roles: [{ emoji: String, roleId: String, description: String }]
      }]
    },
    giveaways: {
      enabled: { type: Boolean, default: false },
      defaultDuration: { type: Number, default: 86400 },
      defaultWinners: { type: Number, default: 1 },
      logChannelId: { type: String, default: null }
    },
    birthdays: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      roleId: { type: String, default: null },
      message: { type: String, default: '🎂 Alles Gute zum Geburtstag {user}!' }
    },
    economy: {
      enabled: { type: Boolean, default: false },
      currencyName: { type: String, default: 'Coins' },
      currencyEmoji: { type: String, default: '🪙' },
      dailyAmount: { type: Number, default: 100 },
      workAmount: { type: Number, default: 50 },
      startBalance: { type: Number, default: 0 }
    },
    starboard: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      emoji: { type: String, default: '⭐' },
      threshold: { type: Number, default: 3 },
      ignoreBots: { type: Boolean, default: true }
    },
    customCommands: {
      enabled: { type: Boolean, default: false },
      commands: [{
        name: String,
        response: String,
        description: String,
        roleId: String
      }]
    },
    inviteTracking: {
      enabled: { type: Boolean, default: false },
      channelId: { type: String, default: null },
      message: { type: String, default: '{user} wurde von {inviter} eingeladen! ({inviter} hat jetzt {count} Einladungen)' }
    },
    polls: {
      enabled: { type: Boolean, default: false },
      defaultDuration: { type: Number, default: 86400 }
    },
    tempChannels: {
      enabled: { type: Boolean, default: false },
      categoryId: { type: String, default: null },
      triggerChannelId: { type: String, default: null },
      channelName: { type: String, default: '{user}s Kanal' },
      userLimit: { type: Number, default: 0 }
    },
    statChannels: {
      enabled: { type: Boolean, default: false },
      channels: [{
        type: { type: String, enum: ['members', 'online', 'bots', 'channels', 'roles'] },
        channelId: String,
        name: String
      }]
    },
    reminders: {
      enabled: { type: Boolean, default: false },
      items: [{
        channelId: String,
        message: String,
        interval: Number,
        lastSent: Date,
        active: { type: Boolean, default: true }
      }]
    },
    notifications: {
      enabled: { type: Boolean, default: false },
      twitch: [{
        username: String,
        channelId: String,
        message: String,
        enabled: { type: Boolean, default: true }
      }],
      youtube: [{
        channelId: String,
        channelName: String,
        discordChannelId: String,
        message: String,
        enabled: { type: Boolean, default: true }
      }],
      reddit: [{
        subreddit: String,
        channelId: String,
        message: String,
        enabled: { type: Boolean, default: true }
      }],
      tiktok: [{
        username: String,
        channelId: String,
        message: String,
        enabled: { type: Boolean, default: true }
      }],
      rss: [{
        url: String,
        channelId: String,
        message: String,
        enabled: { type: Boolean, default: true }
      }]
    },
    achievements: {
      enabled: { type: Boolean, default: false },
      announcementChannelId: { type: String, default: null },
      achievements: [{
        id: String,
        name: String,
        description: String,
        type: { type: String, enum: ['messages','level','invites','voice'], default: 'messages' },
        threshold: { type: Number, default: 100 },
        roleId: { type: String, default: null },
        emoji: { type: String, default: '🏆' }
      }]
    },
    automations: {
      enabled: { type: Boolean, default: false },
      automations: [{
        name: String,
        trigger: String,
        triggerValue: String,
        action: String,
        actionValue: String,
        channelId: String,
        roleId: String,
        enabled: { type: Boolean, default: true }
      }]
    },
    embedBuilder: {
      enabled: { type: Boolean, default: false }
    },
    utility: {
      enabled: { type: Boolean, default: true },
      commands: {
        user:    { enabled: { type: Boolean, default: true } },
        server:  { enabled: { type: Boolean, default: true } },
        avatar:  { enabled: { type: Boolean, default: true } },
        roles:   { enabled: { type: Boolean, default: true } },
        roll:    { enabled: { type: Boolean, default: true } },
        short:   { enabled: { type: Boolean, default: true } },
        top:     { enabled: { type: Boolean, default: true } },
      }
    },
    search: {
      enabled: { type: Boolean, default: false }
    },
    musicQuiz: {
      enabled: { type: Boolean, default: false },
      rounds: { type: Number, default: 10 },
      timePerRound: { type: Number, default: 30 },
      genres: [String]
    },
    crypto: {
      enabled: { type: Boolean, default: false },
      alertChannelId: { type: String, default: null },
      trackedCoins: { type: [String], default: ['BTC','ETH','SOL'] }
    },
    gating: {
      enabled: { type: Boolean, default: false },
      rules: [{
        type:            { type: String, enum: ['nft','token','eth'], default: 'nft' },
        contractAddress: String,   // vorher 'collection' – reserviertes Mongoose-Feld
        minAmount:       { type: Number, default: 1 },
        roleId:          String
      }]
    }
  },

  warnings: [warningSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

guildSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Guild', guildSchema);

