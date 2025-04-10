const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// @route   GET api/health
// @desc    Check server health
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Return health info
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      db: {
        status: dbStatus
      },
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
