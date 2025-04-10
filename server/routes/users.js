const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, telegramId, language } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      username,
      telegramId,
      preferredLanguage: language || 'RU',
      authProvider: telegramId ? 'telegram' : 'email'
    });

    // Hash password if using email auth
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, telegramId } = req.body;

    // Find user by email or telegramId
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (telegramId) {
      user = await User.findOne({ telegramId });
    }

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (user.authProvider === 'email' && password) {
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
    } else if (user.authProvider === 'telegram' && !telegramId) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    // Note: Will add auth middleware later for protected routes
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Authorization required' });
    }

    const user = await User.findById(userId)
      .select('-password')
      .populate('characters');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    // Note: Will add auth middleware later
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ msg: 'Authorization required' });
    }

    const { username, preferredLanguage } = req.body;
    
    // Build update object
    const updateFields = {};
    if (username) updateFields.username = username;
    if (preferredLanguage) updateFields.preferredLanguage = preferredLanguage;

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
