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
    if (question.isResolved) return res.status(400).json({ message: 'Betting is closed for this question' });
    const opt = question.options.find(o => o.label === option);
    if (!opt) return res.status(400).json({ message: 'Option not found' });
    // Save the odds BEFORE updating votes/odds
    const oddsAtBet = opt.odds;
    // Deduct tokens
    user.tokens -= amount;
    opt.votes += amount;

    // Calculate total amount bet on all options
    const totalPool = question.options.reduce((sum, o) => sum + (o.votes || 0), 0);
    const safeTotal = Math.max(totalPool, 1);
    question.options.forEach((o) => {
      // Use admin-set baseMultiplier (baseOdds) as base
      const base = o.baseOdds || o.odds || 1.5;
      const p = (o.votes || 0) / safeTotal;
      const inverseP = 1 - p;
      let newMultiplier = base * (0.9 + 0.2 * inverseP); // smooth, symmetric change
      newMultiplier = Math.max(base * 0.85, Math.min(newMultiplier, base * 1.15));
      o.odds = Number(newMultiplier.toFixed(2));
    });
    await question.save();
    // Create bet with the odds at the time of placement
    const bet = await Bet.create({ userId: user._id, questionId, option, amount, odds: oddsAtBet });
    user.bets.push(bet._id);
    await user.save();
    res.json({ bet, tokens: user.tokens });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bets for the logged-in user
router.get('/my-bets', auth, async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user._id }).sort({ createdAt: -1 }).populate('questionId', 'title');
    res.json(bets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 