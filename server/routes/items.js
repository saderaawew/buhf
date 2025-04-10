const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// @route   GET api/items
// @desc    Get all items
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, rarity } = req.query;
    const query = {};
    
    // Filter by type if provided
    if (type) query.type = type;
    
    // Filter by rarity if provided
    if (rarity) query.rarity = rarity;
    
    const items = await Item.find(query);
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/items/:id
// @desc    Get item by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   GET api/items/shop
// @desc    Get items available in the shop
// @access  Private
router.get('/shop', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    
    // Get items that are either not limited or are still available
    const items = await Item.find({
      $or: [
        { isLimited: false },
        { 
          isLimited: true, 
          availableUntil: { $gt: currentDate } 
        }
      ],
      // Filter for items that have a value (can be purchased)
      $or: [
        { 'value.points': { $gt: 0 } },
        { 'value.tokens': { $gt: 0 } }
      ]
    });
    
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Admin routes for item management (only accessible to admins)

// @route   POST api/items
// @desc    Create a new item
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
      rarity,
      image,
      effects,
      usage,
      value,
      isLimited,
      availableUntil,
      localization
    } = req.body;
    
    // Create new item
    const newItem = new Item({
      name,
      description,
      type,
      rarity: rarity || 'common',
      image: image || 'default-item.png',
      effects,
      usage,
      value,
      isLimited: isLimited || false,
      availableUntil,
      localization
    });
    
    const item = await newItem.save();
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/items/:id
// @desc    Update an item
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
      rarity,
      image,
      effects,
      usage,
      value,
      isLimited,
      availableUntil,
      localization
    } = req.body;
    
    // Find item
    let item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    // Update fields
    if (name) item.name = name;
    if (description) item.description = description;
    if (type) item.type = type;
    if (rarity) item.rarity = rarity;
    if (image) item.image = image;
    if (effects) item.effects = effects;
    if (usage) item.usage = usage;
    if (value) item.value = value;
    if (isLimited !== undefined) item.isLimited = isLimited;
    if (availableUntil) item.availableUntil = availableUntil;
    if (localization) item.localization = localization;
    
    // Save item
    await item.save();
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/items/:id
// @desc    Delete an item
// @access  Admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Find item
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    // Delete item
    await item.remove();
    
    res.json({ msg: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Item not found' });
    }
    
    res.status(500).send('Server error');
  }
});

module.exports = router;
