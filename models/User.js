const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  tokens: { type: Number, default: 1000 },
  winnings: { type: Number, default: 0 },
  bets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bet' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 