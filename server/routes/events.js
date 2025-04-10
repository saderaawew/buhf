const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Character = require('../models/Character');
const auth = require('../middleware/auth');

// @route   GET api/events
// @desc    Get all active events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Get all events that are currently active (between start and end dates)
    const events = await Event.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });
    
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/events/:id
// @desc    Get event by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('linkedQuests')
      .populate('linkedLocations')
      .populate('rewards.items.itemId');
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST api/events/:id/participate
// @desc    Record a character's participation in an event
// @access  Private
router.post('/:id/participate', auth, async (req, res) => {
  try {
    const { characterId } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ msg: 'Character ID is required' });
    }
    
    // Find event
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Check if event is active
    const currentDate = new Date();
    if (!event.isActive || currentDate < event.startDate || currentDate > event.endDate) {
      return res.status(400).json({ msg: 'Event is not currently active' });
    }
    
    // Find character
    const character = await Character.findById(characterId);
    
    if (!character) {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    // Check if character belongs to user
    if (character.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Check if character meets event requirements
    if (character.level < event.requirements.level) {
      return res.status(400).json({ 
        msg: `Character needs to be level ${event.requirements.level} to participate in this event` 
      });
    }
    
    // Check skill requirements if any
    const skillsCheck = Object.entries(event.requirements.skills || {}).every(([skill, value]) => {
      return character.skills[skill] >= value;
    });
    
    if (!skillsCheck) {
      return res.status(400).json({ msg: 'Character does not meet skill requirements for this event' });
    }
    
    // Start any event-linked quests that aren't already active
    const questsStarted = [];
    
    if (event.linkedQuests && event.linkedQuests.length > 0) {
      for (const questId of event.linkedQuests) {
        // Check if character already has this quest
        const alreadyStarted = character.activeQuests.some(
          q => q.questId.toString() === questId.toString()
        );
        
        // Check if character already completed this quest
        const alreadyCompleted = character.completedQuests.some(
          q => q.questId.toString() === questId.toString()
        );
        
        if (!alreadyStarted && !alreadyCompleted) {
          character.activeQuests.push({
            questId,
            progress: 0,
            startedAt: Date.now()
          });
          
          questsStarted.push(questId);
        }
      }
    }
    
    // Grant immediate rewards if applicable
    let rewardsGranted = false;
    
    if (event.rewards) {
      // Add experience, points, tokens
      if (event.rewards.experience) {
        character.experience += event.rewards.experience;
        rewardsGranted = true;
      }
      
      if (event.rewards.points) {
        character.points += event.rewards.points;
        rewardsGranted = true;
      }
      
      if (event.rewards.tokens) {
        character.tokens += event.rewards.tokens;
        rewardsGranted = true;
      }
      
      // Check for level up
      if (event.rewards.experience) {
        const newLevel = 1 + Math.floor(character.experience / 100);
        if (newLevel > character.level) {
          character.level = newLevel;
        }
      }
      
      // Add random items based on chance
      const itemsAwarded = [];
      
      if (event.rewards.items && event.rewards.items.length > 0) {
        for (const rewardItem of event.rewards.items) {
          const roll = Math.random() * 100;
          
          if (roll <= (rewardItem.chance || 100)) {
            // Add item to character's inventory
            const existingItemIndex = character.inventory.findIndex(
              item => item.itemId.toString() === rewardItem.itemId.toString()
            );
            
            if (existingItemIndex > -1) {
              // Update quantity
              character.inventory[existingItemIndex].quantity += rewardItem.quantity || 1;
            } else {
              // Add item to inventory
              character.inventory.push({
                itemId: rewardItem.itemId,
                quantity: rewardItem.quantity || 1,
                acquired: Date.now()
              });
            }
            
            itemsAwarded.push({
              itemId: rewardItem.itemId,
              quantity: rewardItem.quantity || 1
            });
            
            rewardsGranted = true;
          }
        }
      }
    }
    
    // Save character if any changes were made
    if (questsStarted.length > 0 || rewardsGranted) {
      await character.save();
    }
    
    // Generate participation results
    const participationResults = {
      event,
      character: {
        id: character._id,
        name: character.name,
        level: character.level,
        experience: character.experience,
        points: character.points,
        tokens: character.tokens
      },
      questsStarted,
      rewardsGranted
    };
    
    // If event has Telegram integration, send notification here (implement later)
    
    res.json(participationResults);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event or character not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// Admin routes for event management (only accessible to admins)

// @route   POST api/events
// @desc    Create a new event
// @access  Admin only
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const {
      name,
      description,
      type,
      startDate,
      endDate,
      image,
      rewards,
      requirements,
      linkedQuests,
      linkedLocations,
      telegramIntegration,
      localization
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !type || !startDate || !endDate) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }
    
    // Create new event
    const newEvent = new Event({
      name,
      description,
      type,
      startDate,
      endDate,
      image,
      isActive: true, // Default to active
      rewards: rewards || {
        experience: 0,
        points: 0,
        tokens: 0,
        items: []
      },
      requirements: requirements || { level: 1 },
      linkedQuests: linkedQuests || [],
      linkedLocations: linkedLocations || [],
      telegramIntegration: telegramIntegration || {
        notificationEnabled: false,
        leaderboardEnabled: false
      },
      localization
    });
    
    const event = await newEvent.save();
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Admin only
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const {
      name,
      description,
      type,
      startDate,
      endDate,
      image,
      isActive,
      rewards,
      requirements,
      linkedQuests,
      linkedLocations,
      telegramIntegration,
      localization
    } = req.body;
    
    // Find event
    let event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    // Update fields
    if (name) event.name = name;
    if (description) event.description = description;
    if (type) event.type = type;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (image) event.image = image;
    if (isActive !== undefined) event.isActive = isActive;
    if (rewards) event.rewards = rewards;
    if (requirements) event.requirements = requirements;
    if (linkedQuests) event.linkedQuests = linkedQuests;
    if (linkedLocations) event.linkedLocations = linkedLocations;
    if (telegramIntegration) event.telegramIntegration = telegramIntegration;
    if (localization) event.localization = localization;
    
    // Save event
    await event.save();
    
    res.json(event);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Event not found' });
    }
    
    res.status(500).send('Server error');
  }
});

module.exports = router;
