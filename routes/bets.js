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
    // Deduct tokens
    user.tokens -= amount;
    opt.votes += amount;

    // --- Dynamic Odds Calculation (with smoothing) ---
    // Calculate total tokens bet on all options
    const totalBets = question.options.reduce((sum, o) => sum + (o.votes || 0), 0) || 1;
    // Use initial odds as base ratios
    const baseRatios = question.options.map(o => o.odds || 1.5);
    const baseSum = baseRatios.reduce((a, b) => a + b, 0) || 1;
    question.options.forEach((o, idx) => {
      const betRatio = (o.votes || 0) / totalBets;
      // Dynamic odds (inverse to bet ratio, but not too fast)
      let dynamicOdds = (baseRatios[idx] / baseSum) * (1 / Math.max(betRatio, 0.15)) * 1.2;
      // Weighted average for smoothing
      let newOdds = 0.7 * (baseRatios[idx]) + 0.3 * dynamicOdds;
      // Clamp odds between 1.2 and 10
      newOdds = Math.max(1.2, Math.min(newOdds, 10));
      o.odds = parseFloat(newOdds.toFixed(2));
    });
    await question.save();
    // Create bet
    const bet = await Bet.create({ userId: user._id, questionId, option, amount, odds: opt.odds });
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
    const bets = await Bet.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(bets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 