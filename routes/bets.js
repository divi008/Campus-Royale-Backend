const express = require('express');
const Bet = require('../models/Bet');
const User = require('../models/User');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

const router = express.Router();

// Place a bet
router.post('/place-bet', auth, async (req, res) => {
  const { questionId, option, amount } = req.body;
  if (!questionId || !option || !amount) return res.status(400).json({ message: 'All fields required' });
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.tokens < amount) return res.status(400).json({ message: 'Not enough tokens' });
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    const opt = question.options.find(o => o.label === option);
    if (!opt) return res.status(400).json({ message: 'Option not found' });
    // Deduct tokens
    user.tokens -= amount;
    opt.votes += amount;
    await question.save();
    // Create bet
    const bet = await Bet.create({ userId: user._id, questionId, option, amount });
    user.bets.push(bet._id);
    await user.save();
    res.json({ bet, tokens: user.tokens });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 