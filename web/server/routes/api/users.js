const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');

// Eigenes Profil
router.get('/@me', isAuthenticated, (req, res) => {
  res.json({
    id: req.user.discordId,
    username: req.user.username,
    avatar: req.user.avatar,
    discriminator: req.user.discriminator,
    guilds: req.user.guilds
  });
});

module.exports = router;

