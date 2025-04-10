const express = require('express');
const router = express.Router();
const Quest = require('../models/Quest');
const Character = require('../models/Character');
const auth = require('../middleware/auth');

// @route   GET api/quests
// @desc    Get all quests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, difficulty, level } = req.query;
    const query = {};
    
    // Filter by type if provided
    if (type) query.type = type;
    
    // Filter by difficulty if provided
    if (difficulty) query.difficulty = difficulty;
    
    // Filter by level if provided
    if (level) query['requirements.level'] = { $lte: parseInt(level) };
    
    // Add isActive filter to show only active quests
    query.isActive = true;
    
    // Filter by date for time-limited quests
    const currentDate = new Date();
    query.$or = [
      { startDate: { $lte: currentDate }, endDate: { $gte: currentDate } },
      { endDate: { $exists: false } }
    ];
    
    const quests = await Quest.find(query);
    res.json(quests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/quests/:id
// @desc    Get quest by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ msg: 'Quest not found' });
    }
    
    res.json(quest);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quest not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST api/quests/:id/start
// @desc    Start a quest for a character
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    const { characterId } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ msg: 'Character ID is required' });
    }
    
    // Find quest
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ msg: 'Quest not found' });
    }
    
    // Check if quest is active
    if (!quest.isActive) {
      return res.status(400).json({ msg: 'Quest is not available' });
    }
    
    // Find character
    let character = await Character.findById(characterId);
    
    if (!character) {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    // Check if character belongs to user
    if (character.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Check if character meets quest requirements
    if (character.level < quest.requirements.level) {
      return res.status(400).json({ msg: `Character needs to be level ${quest.requirements.level} to start this quest` });
    }
    
    // Check if character already has this quest
    const alreadyStarted = character.activeQuests.some(
      q => q.questId.toString() === quest._id.toString()
    );
    
    if (alreadyStarted) {
      return res.status(400).json({ msg: 'Quest already started' });
    }
    
    // Check if character already completed this quest
    const alreadyCompleted = character.completedQuests.some(
      q => q.questId.toString() === quest._id.toString()
    );
    
    if (alreadyCompleted && quest.type !== 'daily') {
      return res.status(400).json({ msg: 'Quest already completed' });
    }
    
    // Add quest to character's active quests
    character.activeQuests.push({
      questId: quest._id,
      progress: 0,
      startedAt: Date.now()
    });
    
    await character.save();
    
    // Return character with populated active quests
    character = await Character.findById(characterId).populate('activeQuests.questId');
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quest or character not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST api/quests/:id/progress
// @desc    Update quest progress
// @access  Private
router.post('/:id/progress', auth, async (req, res) => {
  try {
    const { characterId, objectiveIndex, completed } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ msg: 'Character ID is required' });
    }
    
    // Find quest
    const quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ msg: 'Quest not found' });
    }
    
    // Find character
    let character = await Character.findById(characterId);
    
    if (!character) {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    // Check if character belongs to user
    if (character.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Check if character has this quest
    const questIndex = character.activeQuests.findIndex(
      q => q.questId.toString() === quest._id.toString()
    );
    
    if (questIndex === -1) {
      return res.status(400).json({ msg: 'Quest not started by this character' });
    }
    
    // Update objective progress
    if (objectiveIndex !== undefined && quest.objectives[objectiveIndex]) {
      // Clone objectives from the quest
      const objectives = [...quest.objectives];
      objectives[objectiveIndex].completed = completed || true;
      
      // Calculate overall progress
      const totalObjectives = objectives.length;
      const completedObjectives = objectives.filter(obj => obj.completed).length;
      const progress = Math.floor((completedObjectives / totalObjectives) * 100);
      
      // Update quest progress
      character.activeQuests[questIndex].progress = progress;
      
      // If all objectives are completed, auto-complete the quest
      if (progress === 100) {
        // Add to completed quests
        character.completedQuests.push({
          questId: quest._id,
          completedAt: Date.now(),
          rewards: quest.rewards
        });
        
        // Give rewards
        character.experience += quest.rewards.experience || 0;
        character.points += quest.rewards.points || 0;
        character.tokens += quest.rewards.tokens || 0;
        
        // Check for level up
        const newLevel = 1 + Math.floor(character.experience / 100);
        if (newLevel > character.level) {
          character.level = newLevel;
        }
        
        // Remove from active quests
        character.activeQuests.splice(questIndex, 1);
        
        // Unlock locations if any
        if (quest.rewards.unlockedLocations && quest.rewards.unlockedLocations.length > 0) {
          quest.rewards.unlockedLocations.forEach(locationId => {
            if (!character.unlockedLocations.includes(locationId)) {
              character.unlockedLocations.push(locationId);
            }
          });
        }
      }
      
      await character.save();
      
      // Return character with populated quests
      character = await Character.findById(characterId)
        .populate('activeQuests.questId')
        .populate('completedQuests.questId')
        .populate('unlockedLocations');
      
      return res.json({
        character,
        questCompleted: progress === 100
      });
    }
    
    res.status(400).json({ msg: 'Invalid objective index' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quest or character not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// Admin routes for quest management (only accessible to admins)

// @route   POST api/quests
// @desc    Create a new quest
// @access  Admin only
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const {
      title,
      description,
      type,
      difficulty,
      requirements,
      objectives,
      rewards,
      timeLimit,
      startDate,
      endDate,
      localization
    } = req.body;
    
    // Create new quest
    const newQuest = new Quest({
      title,
      description,
      type: type || 'side',
      difficulty: difficulty || 'beginner',
      requirements: requirements || { level: 1 },
      objectives,
      rewards,
      timeLimit,
      startDate: startDate || Date.now(),
      endDate,
      isActive: true,
      localization
    });
    
    const quest = await newQuest.save();
    
    res.json(quest);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/quests/:id
// @desc    Update a quest
// @access  Admin only
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const {
      title,
      description,
      type,
      difficulty,
      requirements,
      objectives,
      rewards,
      timeLimit,
      isActive,
      startDate,
      endDate,
      localization
    } = req.body;
    
    // Find quest
    let quest = await Quest.findById(req.params.id);
    
    if (!quest) {
      return res.status(404).json({ msg: 'Quest not found' });
    }
    
    // Update fields
    if (title) quest.title = title;
    if (description) quest.description = description;
    if (type) quest.type = type;
    if (difficulty) quest.difficulty = difficulty;
    if (requirements) quest.requirements = requirements;
    if (objectives) quest.objectives = objectives;
    if (rewards) quest.rewards = rewards;
    if (timeLimit) quest.timeLimit = timeLimit;
    if (isActive !== undefined) quest.isActive = isActive;
    if (startDate) quest.startDate = startDate;
    if (endDate) quest.endDate = endDate;
    if (localization) quest.localization = localization;
    
    // Save quest
    await quest.save();
    
    res.json(quest);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Quest not found' });
    }
    
    res.status(500).send('Server error');
  }
});

module.exports = router;
