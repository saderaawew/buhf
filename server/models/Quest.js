const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  title: {
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
    enum: ['main', 'side', 'daily', 'event'],
    default: 'side'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
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
    },
    items: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
      },
      quantity: {
        type: Number,
        default: 1
      }
    }],
    previousQuests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    }]
  },
  objectives: [{
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['visit_location', 'collect_item', 'use_item', 'talk_to_npc', 'achieve_skill', 'custom'],
      required: true
    },
    targetId: {
      // Could be a location ID, item ID, NPC ID, etc.
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'objectives.targetModel'
    },
    targetModel: {
      type: String,
      enum: ['Location', 'Item', 'NPC', null],
      default: null
    },
    quantity: {
      type: Number,
      default: 1
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
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
      }
    }],
    unlockedLocations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    }]
  },
  timeLimit: {
    enabled: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number, // in minutes
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  // Localization fields
  localization: {
    RU: {
      title: String,
      description: String,
      objectives: [{
        description: String
      }]
    },
    EN: {
      title: String,
      description: String,
      objectives: [{
        description: String
      }]
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quest', QuestSchema);
