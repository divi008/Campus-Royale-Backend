const express = require('express');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

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

module.exports = router; 