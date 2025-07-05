const express = require('express');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();
const Bet = require('../models/Bet');
const User = require('../models/User');

// Add question (admin only)
router.post('/questions', auth, admin, async (req, res) => {
  try {
    const { title, description, options } = req.body;
    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Title and at least 2 options required' });
    }
    const question = await Question.create({ title, description, options });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question (admin only)
router.delete('/questions/:id', auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Question.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update question (admin only)
router.put('/questions/:id', auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, options } = req.body;
    if (!title || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Title and at least 2 options required' });
    }
    const updated = await Question.findByIdAndUpdate(
      id,
      { title, description, options },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin resolves a question and credits winnings
router.post('/questions/:id/resolve', auth, admin, async (req, res) => {
  const { correctOption } = req.body;
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    question.correctOption = correctOption;
    question.isResolved = true;
    await question.save();

    // Find all bets for this question
    const bets = await Bet.find({ questionId: question._id, resolved: { $ne: true } });
    let results = [];
    for (const bet of bets) {
      let won = false;
      let winnings = 0;
      if (bet.option === correctOption) {
        // Find the odds for this option
        const opt = question.options.find(o => o.label === correctOption);
        const odds = opt ? opt.odds : 1.5;
        winnings = bet.amount * odds;
        won = true;
        // Credit user
        await User.findByIdAndUpdate(bet.userId, {
          $inc: { tokens: winnings, winnings: winnings }
        });
      }
      // Mark bet as resolved
      bet.resolved = true;
      bet.won = won;
      bet.winnings = winnings;
      await bet.save();
      results.push({ betId: bet._id, userId: bet.userId, won, winnings });
    }
    res.json({ message: 'Question resolved and winnings credited', results });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 