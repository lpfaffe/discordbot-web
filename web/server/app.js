require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

// bufferCommands aus – kein stilles Warten mehr
mongoose.set('bufferCommands', false);

const app = express();

// Passport konfigurieren
require('./config/passport')(passport);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3001',
  'https://rls-nds.eu',
  'https://www.rls-nds.eu'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blockiert: ${origin}`));
  },
  credentials: true
}));

// Nginx als Proxy vertrauen
app.set('trust proxy', 1);

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_aendern',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, ttl: 7 * 24 * 60 * 60 }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : false
  }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/guilds', require('./routes/api/guilds'));
app.use('/api/modules', require('./routes/api/modules'));
app.use('/api/profiles', require('./routes/api/profiles'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/leaderboard', require('./routes/api/leaderboard'));
app.use('/api/admin', require('./routes/api/admin'));

// Ban-Check
app.use('/api', async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) return next();
  try {
    const { Admin } = require('./models');
    const doc = await Admin.findOne({});
    const isBanned = doc?.bannedUsers?.some(b => b.discordId === req.user.discordId);
    if (isBanned) {
      const ban = doc.bannedUsers.find(b => b.discordId === req.user.discordId);
      return res.status(403).json({ error: `Gesperrt: ${ban.reason}` });
    }
  } catch {}
  next();
});

// Root-Route
app.get('/', (req, res) => {
  res.json({ message: '🤖 Discord Bot Dashboard API', status: 'online', frontend: process.env.FRONTEND_URL });
});

// React App in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Error Handler
app.use((err, req, res, next) => {
  console.error(`❌ [${req.method}] ${req.path} →`, err.message);
  res.status(500).json({ error: 'Interner Server-Fehler' });
});

const PORT = parseInt(process.env.WEB_PORT || 3001);

// ── Server erst starten NACHDEM MongoDB verbunden ist ──────
async function startApp() {
  try {
    console.log('🔄 Verbinde MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    console.log('✅ MongoDB verbunden (Web)');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🌐 Web Server läuft auf Port ${PORT}`);
      console.log(`🌍 Erreichbar über: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') { console.error(`❌ Port ${PORT} belegt!`); process.exit(1); }
      throw err;
    });

  } catch (err) {
    console.error('❌ Startup Fehler:', err.message);
    process.exit(1);
  }
}

startApp();

module.exports = app;
