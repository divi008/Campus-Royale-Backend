const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  label: String,
  odds: Number,
  votes: { type: Number, default: 0 },
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  options: [OptionSchema],
  isResolved: { type: Boolean, default: false },
  correctOption: { type: String, default: null },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema); 