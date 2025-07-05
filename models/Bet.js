const mongoose = require('mongoose');

const BetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  option: { type: String, required: true },
  amount: { type: Number, required: true },
  resolved: { type: Boolean, default: false },
  won: { type: Boolean, default: false },
  winnings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Bet', BetSchema); 