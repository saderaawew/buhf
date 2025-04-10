const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Character = require('../models/Character');
const auth = require('../middleware/auth');

// @route   GET api/leaderboard
// @desc    Get global leaderboard
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { type, limit } = req.query;
    const leaderboardLimit = parseInt(limit) || 20;
    
    // Different types of leaderboards
    let leaderboardQuery = {};
    let sortOption = {};
    
    switch(type || 'experience') {
      case 'points':
        sortOption = { points: -1 }; // Descending order
        break;
      case 'tokens':
        sortOption = { tokens: -1 }; // Descending order
        break;
      case 'level':
        sortOption = { level: -1, experience: -1 }; // First by level, then by experience
        break;
      case 'experience':
      default:
        sortOption = { experience: -1 }; // Descending order
        break;
    }
    
    // Get top characters
    const topCharacters = await Character.find(leaderboardQuery)
      .sort(sortOption)
      .limit(leaderboardLimit)
      .populate({
        path: 'userId',
        select: 'username telegramId'
      });
    
    // Format leaderboard data
    const leaderboard = await Promise.all(
      topCharacters.map(async (character, index) => {
        return {
          rank: index + 1,
          characterId: character._id,
          characterName: character.name,
          characterLevel: character.level,
          username: character.userId?.username || 'Unknown',
          telegramId: character.userId?.telegramId || null,
          value: character[type || 'experience'] || 0
        };
      })
    );
    
    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/leaderboard/event/:eventId
// @desc    Get event-specific leaderboard
// @access  Private
router.get('/event/:eventId', auth, async (req, res) => {
  try {
    const { type, limit } = req.query;
    const leaderboardLimit = parseInt(limit) || 20;
    const eventId = req.params.eventId;
    
    if (!eventId) {
      return res.status(400).json({ msg: 'Event ID is required' });
    }
    
    // For a real event leaderboard, we'd need a separate collection tracking event participation
    // This is a simplified example that would need to be expanded based on event tracking logic
    
    // Different types of leaderboards
    let sortOption = {};
    
    switch(type || 'experience') {
      case 'points':
        sortOption = { points: -1 }; // Descending order
        break;
      case 'tokens':
        sortOption = { tokens: -1 }; // Descending order
        break;
      case 'level':
        sortOption = { level: -1, experience: -1 }; // First by level, then by experience
        break;
      case 'experience':
      default:
        sortOption = { experience: -1 }; // Descending order
        break;
    }
    
    // Get top characters - note: in a real implementation, we'd filter by event participation
    const topCharacters = await Character.find({})
      .sort(sortOption)
      .limit(leaderboardLimit)
      .populate({
        path: 'userId',
        select: 'username telegramId'
      });
    
    // Format leaderboard data
    const leaderboard = await Promise.all(
      topCharacters.map(async (character, index) => {
        return {
          rank: index + 1,
          characterId: character._id,
          characterName: character.name,
          characterLevel: character.level,
          username: character.userId?.username || 'Unknown',
          telegramId: character.userId?.telegramId || null,
          value: character[type || 'experience'] || 0
        };
      })
    );
    
    res.json(leaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/leaderboard/telegram
// @desc    Get leaderboard data formatted for Telegram integration
// @access  Public - for Telegram bot access
router.get('/telegram', async (req, res) => {
  try {
    const { secret, type, limit } = req.query;
    
    // Simple API key validation - in production, use a more secure method
    if (secret !== process.env.TELEGRAM_API_SECRET) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    const leaderboardLimit = parseInt(limit) || 10;
    
    // Different types of leaderboards
    let sortOption = {};
    
    switch(type || 'experience') {
      case 'points':
        sortOption = { points: -1 }; // Descending order
        break;
      case 'tokens':
        sortOption = { tokens: -1 }; // Descending order
        break;
      case 'level':
        sortOption = { level: -1, experience: -1 }; // First by level, then by experience
        break;
      case 'experience':
      default:
        sortOption = { experience: -1 }; // Descending order
        break;
    }
    
    // Get only characters with users that have telegramId
    const topCharacters = await Character.find({})
      .sort(sortOption)
      .limit(leaderboardLimit)
      .populate({
        path: 'userId',
        select: 'username telegramId',
        match: { telegramId: { $ne: null } } // Only include users with telegram IDs
      });
    
    // Filter out entries where populate didn't match (no telegramId)
    const filteredCharacters = topCharacters.filter(character => character.userId);
    
    // Format for Telegram
    const telegramLeaderboard = filteredCharacters.map((character, index) => {
      return {
        rank: index + 1,
        name: character.name,
        level: character.level,
        telegramId: character.userId.telegramId,
        value: character[type || 'experience'] || 0
      };
    });
    
    res.json(telegramLeaderboard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
