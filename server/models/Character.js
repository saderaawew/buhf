const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  level: {
    type: Number,
    default: 1
  },
  experience: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  tokens: {
    type: Number,
    default: 0
  },
  // Character skills related to hookah and cigar knowledge
  skills: {
    tobaccoKnowledge: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    },
    aromaExpertise: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    },
    mixingMastery: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    },
    cigarConnoisseur: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    }
  },
  // Inventory including collected items
  inventory: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    quantity: {
      type: Number,
      default: 1
    },
    acquired: {
      type: Date,
      default: Date.now
    }
  }],
  // Completed quests
  completedQuests: [{
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    rewards: {
      experience: Number,
      points: Number,
      tokens: Number,
      items: [{
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item'
        },
        quantity: Number
      }]
    }
  }],
  // Unlocked locations on the map
  unlockedLocations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  // Current active quests
  activeQuests: [{
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    },
    progress: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastPlayed: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Character', CharacterSchema);
