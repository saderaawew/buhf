const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['cigar', 'hookah_flavor', 'accessory', 'collectible', 'consumable'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  image: {
    type: String,
    default: 'default-item.png'
  },
  effects: {
    // Stat boosts or effects when equipped/used
    skillBoost: {
      skill: {
        type: String,
        enum: ['tobaccoKnowledge', 'aromaExpertise', 'mixingMastery', 'cigarConnoisseur']
      },
      value: {
        type: Number,
        default: 0
      }
    },
    pointsBoost: {
      type: Number,
      default: 0
    },
    tokensBoost: {
      type: Number,
      default: 0
    }
  },
  // For consumables: what happens when used
  usage: {
    consumable: {
      type: Boolean,
      default: false
    },
    cooldown: {
      type: Number,
      default: 0 // in seconds
    },
    effect: {
      type: String,
      default: ''
    }
  },
  // For in-game shop
  value: {
    points: {
      type: Number,
      default: 0
    },
    tokens: {
      type: Number,
      default: 0
    }
  },
  // For limited edition items
  isLimited: {
    type: Boolean,
    default: false
  },
  availableUntil: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Localization fields
  localization: {
    RU: {
      name: String,
      description: String
    },
    EN: {
      name: String,
      description: String
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', ItemSchema);
