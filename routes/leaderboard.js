const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get leaderboard (top users by tokens)
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find().sort({ tokens: -1 }).limit(20).select('username tokens winnings');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 