const express = require('express');
const passport = require('passport');
const router = express.Router();

const FRONTEND = process.env.FRONTEND_URL || 'https://rls-nds.eu';
const CALLBACK_URL = process.env.DISCORD_CALLBACK_URL || 'https://rls-nds.eu/auth/callback';

// Login starten
router.get('/discord', passport.authenticate('discord', { scope: ['identify', 'guilds'] }));

// Callback – custom handler damit kein 500 bei TokenError
router.get('/callback', (req, res, next) => {
  passport.authenticate('discord', (err, user, info) => {
    if (err) {
      console.error('OAuth2 Fehler:', err.name, err.message);
      return res.redirect('/auth/failed?reason=' + encodeURIComponent(err.name || 'TokenError'));
    }
    if (!user) {
      console.warn('OAuth2: kein User', info);
      return res.redirect('/auth/failed?reason=no_user');
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Login Fehler:', loginErr.message);
        return res.redirect('/auth/failed?reason=login_error');
      }
      console.log('Eingeloggt:', user.username);
      return res.redirect(FRONTEND + '/dashboard');
    });
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => res.redirect(FRONTEND));
});

// Fehlerseite
router.get('/failed', (req, res) => {
  const reason = req.query.reason || 'unknown';
  const hints = {
    TokenError:  'Client Secret falsch oder Code bereits verwendet. Erneut versuchen.',
    no_user:     'Discord hat keinen Benutzer zurückgegeben.',
    login_error: 'Session konnte nicht erstellt werden.',
    unknown:     'Unbekannter Fehler.'
  };
  res.status(401).send(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<title>Login fehlgeschlagen</title>
<style>body{font-family:sans-serif;background:#1a1a2e;color:#eee;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{background:#16213e;border-radius:12px;padding:40px;max-width:500px;width:90%;text-align:center}
h1{color:#e94560;margin-bottom:16px}p{color:#aaa;font-size:14px}
.hint{background:#0f3460;border-radius:8px;padding:16px;margin:20px 0;text-align:left;font-size:13px;line-height:1.8}
code{background:#1a4a8a;padding:2px 6px;border-radius:4px;font-size:12px;word-break:break-all}
a.btn{display:inline-block;margin-top:20px;background:#5865F2;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold}</style>
</head><body><div class="box">
<h1>❌ Login fehlgeschlagen</h1>
<p>Fehler: <code>${reason}</code></p>
<div class="hint"><strong>${hints[reason] || hints.unknown}</strong><br><br>
Redirect-URL im Discord Portal:<br><code>${CALLBACK_URL}</code>
</div>
<a class="btn" href="/auth/discord">🔄 Erneut versuchen</a>
</div></body></html>`);
});

// Aktueller User
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Nicht eingeloggt' });
  res.json({ id: req.user.discordId, username: req.user.username, avatar: req.user.avatar, discriminator: req.user.discriminator });
});

module.exports = router;
