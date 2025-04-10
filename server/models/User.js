const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  telegramId: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String,
    required: function() {
      // Password is required unless user authenticates via social auth or Telegram
      return !this.authProvider;
    }
  },
  authProvider: {
    type: String,
    enum: ['email', 'google', 'facebook', 'telegram', null],
    default: null
  },
  role: {
    type: String,
    enum: ['player', 'admin'],
    default: 'player'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  preferredLanguage: {
    type: String,
    enum: ['RU', 'EN'],
    default: 'RU'
  },
  characters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
