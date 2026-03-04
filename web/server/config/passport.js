const path = require('path');
const mongoose = require('mongoose');
const DiscordStrategy = require('passport-discord').Strategy;

// User-Schema direkt hier definieren – nutzt garantiert die web/node_modules mongoose Instanz
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
  createdAt:     { type: Date, default: Date.now },
  updatedAt:     { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

userSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

// Model nur einmal registrieren
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = (passport) => {
  const callbackURL  = process.env.DISCORD_CALLBACK_URL || 'https://rls-nds.eu/auth/callback';
  const clientID     = process.env.DISCORD_CLIENT_ID    || '';
  const clientSecret = process.env.DISCORD_CLIENT_SECRET|| '';

  console.log('🔐 OAuth2 Callback-URL :', callbackURL);
  console.log('🆔 Client ID           :', clientID);
  console.log('🔑 Client Secret (8)   :', clientSecret.substring(0, 8) + '...');
  console.log('🔑 Secret Länge        :', clientSecret.length);

  passport.use(new DiscordStrategy({
    clientID,
    clientSecret,
    callbackURL,
    scope: ['identify', 'guilds']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(`✅ OAuth Login: ${profile.username} (${profile.id})`);
      console.log(`   Mongoose State: ${mongoose.connection.readyState} (1=verbunden)`);

      let user = await User.findOne({ discordId: profile.id });
      const userData = {
        discordId:     profile.id,
        username:      profile.username,
        discriminator: profile.discriminator || '0',
        avatar: profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/0.png`,
        guilds:       (profile.guilds || []).map(g => g.id),
        accessToken,
        refreshToken:  refreshToken || null,
        tokenExpiry:   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      if (user) { Object.assign(user, userData); await user.save(); }
      else { user = await User.create(userData); }
      console.log(`✅ User gespeichert: ${user.username}`);
      return done(null, user);
    } catch (err) {
      console.error(`❌ DB Fehler (${err.name}):`, err.message);
      return done(err, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.discordId));
  passport.deserializeUser(async (discordId, done) => {
    try {
      const user = await User.findOne({ discordId });
      done(null, user);
    } catch (err) {
      console.error('❌ deserializeUser:', err.message);
      done(err, null);
    }
  });
};


module.exports = (passport) => {
  const callbackURL = process.env.DISCORD_CALLBACK_URL || 'https://rls-nds.eu/auth/callback';
  const clientID     = process.env.DISCORD_CLIENT_ID     || '';
  const clientSecret = process.env.DISCORD_CLIENT_SECRET || '';

  // Startup-Log um zu prüfen ob die Werte stimmen
  console.log('🔐 OAuth2 Callback-URL :', callbackURL);
  console.log('🆔 Client ID           :', clientID);
  console.log('🔑 Client Secret (8)   :', clientSecret.substring(0, 8) + '...');
  console.log('🔑 Secret Länge        :', clientSecret.length);

  passport.use(new DiscordStrategy({
    clientID,
    clientSecret,
    callbackURL,
    scope: ['identify', 'guilds']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(`✅ OAuth Login: ${profile.username} (${profile.id})`);
      let user = await User.findOne({ discordId: profile.id });
      const userData = {
        discordId:     profile.id,
        username:      profile.username,
        discriminator: profile.discriminator || '0',
        avatar: profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/0.png`,
        guilds:       (profile.guilds || []).map(g => g.id),
        accessToken,
        refreshToken:  refreshToken || null,
        tokenExpiry:   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      if (user) { Object.assign(user, userData); await user.save(); }
      else { user = await User.create(userData); }
      console.log(`✅ User gespeichert: ${user.username}`);
      return done(null, user);
    } catch (err) {
      console.error(`❌ DB Fehler (${err.name}):`, err.message);
      if (err.name === 'MongooseError') {
        console.error('   → MongoDB nicht bereit. URI:', process.env.MONGODB_URI);
        console.error('   → Mongoose State:', mongoose.connection.readyState);
        // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      }
      return done(err, null);
    }
  }));

  passport.serializeUser((user, done) => done(null, user.discordId));
  passport.deserializeUser(async (discordId, done) => {
    try {
      const user = await User.findOne({ discordId });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
