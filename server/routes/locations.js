const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const Character = require('../models/Character');
const auth = require('../middleware/auth');

// @route   GET api/locations
// @desc    Get all locations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    
    // Filter by type if provided
    if (type) query.type = type;
    
    const locations = await Location.find(query);
    res.json(locations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/locations/:id
// @desc    Get location by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('availableQuests')
      .populate('availableItems.itemId')
      .populate('events');
    
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }
    
    res.json(location);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Location not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   GET api/locations/character/:characterId
// @desc    Get all locations available to a character
// @access  Private
router.get('/character/:characterId', auth, async (req, res) => {
  try {
    // Find character
    const character = await Character.findById(req.params.characterId);
    
    if (!character) {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    // Check if character belongs to user
    if (character.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Get all active locations
    const allLocations = await Location.find({ isActive: true });
    
    // Filter locations based on character's level and unlocked locations
    const availableLocations = allLocations.map(location => {
      const isUnlocked = character.unlockedLocations.some(
        unlocked => unlocked.toString() === location._id.toString()
      );
      
      const levelMet = character.level >= location.unlockRequirements.level;
      
      return {
        ...location.toObject(),
        isAvailable: isUnlocked || (!location.isLocked) || (levelMet && !location.isLocked),
        locked: location.isLocked && !isUnlocked
      };
    });
    
    res.json(availableLocations);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Character not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST api/locations/:id/visit
// @desc    Record a character's visit to a location
// @access  Private
router.post('/:id/visit', auth, async (req, res) => {
  try {
    const { characterId } = req.body;
    
    if (!characterId) {
      return res.status(400).json({ msg: 'Character ID is required' });
    }
    
    // Find location
    const location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
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
    
    // Check if location is locked
    const isUnlocked = character.unlockedLocations.some(
      unlocked => unlocked.toString() === location._id.toString()
    );
    
    if (location.isLocked && !isUnlocked) {
      return res.status(400).json({ msg: 'Location is locked' });
    }
    
    // Update character's active quests if they have objectives for visiting this location
    let questUpdated = false;
    character.activeQuests.forEach(activeQuest => {
      // Query quest details
      const quest = activeQuest.questId;
      
      if (quest && quest.objectives) {
        // Check for visit_location objectives matching this location
        quest.objectives.forEach((objective, index) => {
          if (
            objective.type === 'visit_location' &&
            objective.targetId &&
            objective.targetId.toString() === location._id.toString() &&
            !objective.completed
          ) {
            objective.completed = true;
            questUpdated = true;
            
            // Update progress
            const completedObjectives = quest.objectives.filter(obj => obj.completed).length;
            activeQuest.progress = Math.floor((completedObjectives / quest.objectives.length) * 100);
          }
        });
      }
    });
    
    // Add to unlocked locations if not already unlocked
    if (!isUnlocked) {
      character.unlockedLocations.push(location._id);
    }
    
    if (questUpdated || !isUnlocked) {
      await character.save();
    }
    
    // Generate visit results
    const visitResults = {
      locationDetails: location,
      // Check for random items that could be found at this location
      itemsFound: []
    };
    
    // Roll for random items if location has available items
    if (location.availableItems && location.availableItems.length > 0) {
      for (const availableItem of location.availableItems) {
        // Random chance to find item based on its chance property
        const roll = Math.random() * 100;
        if (roll <= availableItem.chance) {
          // Add item to character's inventory
          const existingItemIndex = character.inventory.findIndex(
            item => item.itemId.toString() === availableItem.itemId.toString()
          );
          
          if (existingItemIndex > -1) {
            // Update quantity
            character.inventory[existingItemIndex].quantity += 1;
          } else {
            // Add item to inventory
            character.inventory.push({
              itemId: availableItem.itemId,
              quantity: 1,
              acquired: Date.now()
            });
          }
          
          // Add to results
          visitResults.itemsFound.push(availableItem.itemId);
          
          // Save character with new inventory item
          await character.save();
        }
      }
    }
    
    res.json(visitResults);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Location or character not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// Admin routes for location management (only accessible to admins)

// @route   POST api/locations
// @desc    Create a new location
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
      coordinates,
      image,
      backgroundImage,
      isLocked,
      unlockRequirements,
      availableQuests,
      availableItems,
      npcs,
      events,
      localization
    } = req.body;
    
    // Create new location
    const newLocation = new Location({
      name,
      description,
      type,
      coordinates,
      image: image || 'default-location.png',
      backgroundImage,
      isLocked: isLocked !== undefined ? isLocked : true,
      unlockRequirements: unlockRequirements || { level: 1 },
      availableQuests: availableQuests || [],
      availableItems: availableItems || [],
      npcs: npcs || [],
      events: events || [],
      isActive: true,
      localization
    });
    
    const location = await newLocation.save();
    
    res.json(location);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/locations/:id
// @desc    Update a location
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
      coordinates,
      image,
      backgroundImage,
      isLocked,
      unlockRequirements,
      availableQuests,
      availableItems,
      npcs,
      events,
      isActive,
      localization
    } = req.body;
    
    // Find location
    let location = await Location.findById(req.params.id);
    
    if (!location) {
      return res.status(404).json({ msg: 'Location not found' });
    }
    
    // Update fields
    if (name) location.name = name;
    if (description) location.description = description;
    if (type) location.type = type;
    if (coordinates) location.coordinates = coordinates;
    if (image) location.image = image;
    if (backgroundImage) location.backgroundImage = backgroundImage;
    if (isLocked !== undefined) location.isLocked = isLocked;
    if (unlockRequirements) location.unlockRequirements = unlockRequirements;
    if (availableQuests) location.availableQuests = availableQuests;
    if (availableItems) location.availableItems = availableItems;
    if (npcs) location.npcs = npcs;
    if (events) location.events = events;
    if (isActive !== undefined) location.isActive = isActive;
    if (localization) location.localization = localization;
    
    // Save location
    await location.save();
    
    res.json(location);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Location not found' });
    }
    
    res.status(500).send('Server error');
  }
});

module.exports = router;
