// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Register user (teacher or student)
router.post('/register', async (req, res) => {
  try {
    const { name, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({
      name,
      role
    });
    
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;