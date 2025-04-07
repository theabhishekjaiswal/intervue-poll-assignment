// server/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// Get chat history
router.get('/', async (req, res) => {
  try {
    const messages = await Chat.find()
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;