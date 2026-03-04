const express = require('express');
const path = require('path');
const router = express.Router();
const { User } = require('../../models');
const { isAuthenticated } = require('../../middleware/auth');

// Rangliste für eine Guild
router.get('/:guildId', isAuthenticated, async (req, res) => {
  try {
    const { guildId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const allUsers = await User.find({ 'xpData.guildId': guildId });
    const sorted = allUsers
      .map(u => ({
        id: u.discordId,
        username: u.username,
        avatar: u.avatar,
        data: u.xpData.find(d => d.guildId === guildId)
      }))
      .filter(u => u.data)
      .sort((a, b) => b.data.level - a.data.level || b.data.xp - a.data.xp);

    const total = sorted.length;
    const paginated = sorted.slice((page - 1) * limit, page * limit);

    res.json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: paginated.map((u, i) => ({
        rank: (page - 1) * limit + i + 1,
        userId: u.id,
        username: u.username,
        avatar: u.avatar,
        level: u.data.level,
        xp: u.data.xp,
        totalMessages: u.data.totalMessages
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

