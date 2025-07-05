const express = require('express');
const Suggestion = require('../models/Suggestion');
const Question = require('../models/Question');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

// Submit a suggestion (authenticated users only)
router.post('/suggestions', auth, async (req, res) => {
  try {
    const { questionText, options, multipliers } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!questionText || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        message: 'Question text and at least 2 options are required' 
      });
    }

    // Check if user has already submitted 2 suggestions today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySuggestions = await Suggestion.countDocuments({
      suggestedBy: userId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (todaySuggestions >= 2) {
      return res.status(429).json({ 
        message: 'You can only suggest 2 questions per day' 
      });
    }

    // Create suggestion with default multipliers if not provided
    const suggestionData = {
      questionText,
      options,
      multipliers: multipliers || options.map(() => 1.5),
      suggestedBy: userId
    };

    const suggestion = await Suggestion.create(suggestionData);
    await suggestion.populate('suggestedBy', 'username');

    res.status(201).json({
      message: 'Suggestion submitted for review!',
      suggestion
    });
  } catch (err) {
    console.error('Suggestion submission error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all suggestions (admin only)
router.get('/suggestions', auth, admin, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const suggestions = await Suggestion.find(filter)
      .populate('suggestedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (err) {
    console.error('Get suggestions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a suggestion (admin only)
router.put('/suggestions/:id/approve', auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, options } = req.body;

    const suggestion = await Suggestion.findById(id).populate('suggestedBy', 'username');
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    if (suggestion.status !== 'pending') {
      return res.status(400).json({ message: 'Suggestion is not pending' });
    }

    // Create the question from the suggestion
    const questionData = {
      title: title || suggestion.questionText,
      description: description || `Suggested by ${suggestion.suggestedBy.username}`,
      options: options || suggestion.options.map((option, index) => ({
        label: option,
        odds: suggestion.multipliers[index] || 1.5,
        votes: 0
      }))
    };

    const question = await Question.create(questionData);

    // Update suggestion status
    suggestion.status = 'approved';
    await suggestion.save();

    res.json({
      message: 'Suggestion approved and question created!',
      question,
      suggestion
    });
  } catch (err) {
    console.error('Approve suggestion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject a suggestion (admin only)
router.put('/suggestions/:id/reject', auth, admin, async (req, res) => {
  try {
    const { id } = req.params;

    const suggestion = await Suggestion.findById(id);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    if (suggestion.status !== 'pending') {
      return res.status(400).json({ message: 'Suggestion is not pending' });
    }

    suggestion.status = 'rejected';
    await suggestion.save();

    res.json({
      message: 'Suggestion rejected',
      suggestion
    });
  } catch (err) {
    console.error('Reject suggestion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 