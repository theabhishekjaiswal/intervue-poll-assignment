const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import socket handlers
const socketHandlers = require('./socket/socketHandlers');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://intervue-poll-assignment-frontend.onrender.com',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Temporary in-memory storage (instead of MongoDB)
const polls = [];
const users = [];
const chats = [];

// API routes
app.get('/api/polls', (req, res) => {
  res.json(polls);
});

app.get('/api/polls/:id', (req, res) => {
  const poll = polls.find(p => p._id === req.params.id);
  if (!poll) {
    return res.status(404).json({ message: 'Poll not found' });
  }
  res.json(poll);
});

app.post('/api/auth/register', (req, res) => {
  const { name, role } = req.body;
  const existingUser = users.find(u => u.name === name);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = { name, role, createdAt: new Date() };
  users.push(user);
  res.status(201).json(user);
});

app.get('/api/chat', (req, res) => {
  res.json(chats);
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Initialize socket handlers
socketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
