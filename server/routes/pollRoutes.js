// server/routes/pollRoutes.js
const express = require('express');
const router = express.Router();
const Poll = require('../models/poll');

// Get all polls (for teacher)
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find()
      .sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get poll by ID
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;