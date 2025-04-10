const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
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
    enum: ['lounge', 'store', 'event_venue', 'quest_area', 'special'],
    required: true
  },
  coordinates: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  image: {
    type: String,
    default: 'default-location.png'
  },
  backgroundImage: {
    type: String
  },
  isLocked: {
    type: Boolean,
    default: true
  },
  unlockRequirements: {
    level: {
      type: Number,
      default: 1
    },
    quests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quest'
    }],
    items: [{
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item'
      },
      quantity: {
        type: Number,
        default: 1
      }
    }]
  },
  availableQuests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quest'
  }],
  availableItems: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    chance: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  }],
  npcs: [{
    name: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    dialogues: [{
      trigger: {
        type: String,
        enum: ['default', 'quest_start', 'quest_active', 'quest_complete'],
        default: 'default'
      },
      questId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quest'
      },
      text: {
        type: String,
        required: true
      },
      responses: [{
        text: String,
        nextDialogueId: String,
        action: {
          type: String,
          enum: ['none', 'start_quest', 'complete_objective', 'give_item', 'take_item'],
          default: 'none'
        },
        actionTarget: {
          type: mongoose.Schema.Types.ObjectId
        }
      }]
    }]
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  // Localization fields
  localization: {
    RU: {
      name: String,
      description: String,
      npcs: [{
        name: String,
        dialogues: [{
          text: String,
          responses: [{
            text: String
          }]
        }]
      }]
    },
    EN: {
      name: String,
      description: String,
      npcs: [{
        name: String,
        dialogues: [{
          text: String,
          responses: [{
            text: String
          }]
        }]
      }]
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Location', LocationSchema);
