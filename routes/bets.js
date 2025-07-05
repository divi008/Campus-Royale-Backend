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

    // --- Dynamic Odds Calculation (with smoothing) ---
    // Ensure each option has a baseOdds field (set at question creation, fallback to initial odds)
    question.options.forEach((o) => {
      if (typeof o.baseOdds !== 'number') {
        o.baseOdds = o.odds || 1.5;
      }
    });
    const basePool = 500;
    const totalPool = question.options.reduce((sum, o) => sum + (basePool + (o.votes || 0)), 0);
    question.options.forEach((o) => {
      const optionPool = basePool + (o.votes || 0);
      const baseOdds = o.baseOdds;
      let newOdds = baseOdds * (totalPool / optionPool);
      newOdds = Math.max(baseOdds * 0.5, Math.min(newOdds, baseOdds * 3));
      o.odds = parseFloat(newOdds.toFixed(2));
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