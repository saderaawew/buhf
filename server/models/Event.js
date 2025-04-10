const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
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
    enum: ['special_offer', 'competition', 'seasonal', 'promotion'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: false
  },
  rewards: {
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
    items: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
      },
      quantity: {
        type: Number,
        default: 1
      },
      chance: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
      }
    }],
    promoCode: {
      code: String,
      discount: Number, // percentage
      validUntil: Date
    }
  },
  requirements: {
    level: {
      type: Number,
      default: 1
    },
    skills: {
      tobaccoKnowledge: {
        type: Number,
        default: 0
      },
      aromaExpertise: {
        type: Number,
        default: 0
      },
      mixingMastery: {
        type: Number,
        default: 0
      },
      cigarConnoisseur: {
        type: Number,
        default: 0
      }
    }
  },
  linkedQuests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest'
  }],
  linkedLocations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  }],
  telegramIntegration: {
    notificationEnabled: {
      type: Boolean,
      default: false
    },
    message: String,
    leaderboardEnabled: {
      type: Boolean,
      default: false
    }
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

module.exports = mongoose.model('Event', EventSchema);
