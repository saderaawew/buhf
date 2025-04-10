const express = require('express');
const router = express.Router();
const Character = require('../models/Character');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/characters
// @desc    Create a character
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ msg: 'Name is required' });
    }
    
    // Create new character
    const newCharacter = new Character({
      userId: req.user.id,
      name,
      avatar: avatar || 'default-avatar.png',
      // Default starting location would be added here
      unlockedLocations: [] // Will add starter location ID later
    });
    
    const character = await newCharacter.save();
    
    // Add character to user's characters array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { characters: character._id } }
    );
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/characters
// @desc    Get all characters for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const characters = await Character.find({ userId: req.user.id });
    res.json(characters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/characters/:id
// @desc    Get character by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id)
      .populate('inventory.itemId')
      .populate('completedQuests.questId')
      .populate('unlockedLocations')
      .populate('activeQuests.questId');
    
    // Check if character exists
    if (!character) {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    // Check if character belongs to user
    if (character.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   PUT api/characters/:id
// @desc    Update character
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    
    // Find character
    let character = await Character.findById(req.params.id);
    
    // Check if character exists
    if (!character) {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    // Check if character belongs to user
    if (character.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update fields
    if (name) character.name = name;
    if (avatar) character.avatar = avatar;
    
    // Save character
    await character.save();
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST api/characters/:id/addExperience
// @desc    Add experience to character
// @access  Private
router.post('/:id/addExperience', auth, async (req, res) => {
  try {
    const { amount, source } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Invalid experience amount' });
    }
    
    // Find character
    let character = await Character.findById(req.params.id);
    
    // Check if character exists
    if (!character) {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    // Check if character belongs to user
    if (character.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Add experience
    character.experience += parseInt(amount);
    
    // Check for level up
    // Simple leveling formula: level = 1 + Math.floor(experience / 100)
    const newLevel = 1 + Math.floor(character.experience / 100);
    
    let leveledUp = false;
    if (newLevel > character.level) {
      character.level = newLevel;
      leveledUp = true;
    }
    
    // Save character
    await character.save();
    
    res.json({
      character,
      leveledUp,
      source: source || 'game_action'
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST api/characters/:id/addItem
// @desc    Add item to character inventory
// @access  Private
router.post('/:id/addItem', auth, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ msg: 'Item ID is required' });
    }
    
    // Find character
    let character = await Character.findById(req.params.id);
    
    // Check if character exists
    if (!character) {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    // Check if character belongs to user
    if (character.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Check if item is already in inventory
    const existingItemIndex = character.inventory.findIndex(
      item => item.itemId.toString() === itemId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      character.inventory[existingItemIndex].quantity += quantity || 1;
    } else {
      // Add item to inventory
      character.inventory.push({
        itemId,
        quantity: quantity || 1,
        acquired: Date.now()
      });
    }
    
    // Save character
    await character.save();
    
    // Return updated character with populated inventory
    character = await Character.findById(req.params.id).populate('inventory.itemId');
    
    res.json(character);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    res.status(500).send('Server error');
  }
});

module.exports = router;
