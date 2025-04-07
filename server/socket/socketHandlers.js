module.exports = (io) => {
  // Store active polls and users
  const activePoll = { current: null };
  const activeUsers = new Map();
  const userSockets = new Map();
  const pollHistory = [];
  const chatMessages = [];

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins (teacher or student)
    socket.on('join', ({ name, role }) => {
      const user = { id: socket.id, name, role };
      activeUsers.set(socket.id, user);
      userSockets.set(name, socket.id);

      console.log(`${role} ${name} joined`);

      // Send current poll state if exists
      if (activePoll.current) {
        socket.emit('poll:current', activePoll.current);
      } else if (role === 'student') {
        socket.emit('waitForTeacher');
      }

      // Notify teacher about new student
      if (role === 'student') {
        io.emit('user:joined', {
          id: socket.id,
          name,
          role
        });
      }
    });

    // after the 'join' event handler

    // Get connected students
    socket.on('getConnectedStudents', () => {
      const user = activeUsers.get(socket.id);

      if (!user || user.role !== 'teacher') {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      // Get all connected students
      const students = Array.from(activeUsers.values())
        .filter(user => user.role === 'student')
        .map(user => ({
          id: user.id,
          name: user.name,
          role: user.role
        }));

      socket.emit('connectedStudents', students);
    });


    // Teacher creates a new poll
    socket.on('poll:create', ({ question, options, timeLimit }) => {
      const teacher = activeUsers.get(socket.id);

      if (!teacher || teacher.role !== 'teacher') {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      // Check if there is an active poll
      if (activePoll.current && activePoll.current.active) {
        return socket.emit('error', { message: 'There is already an active poll' });
      }

      // Create new poll
      const poll = {
        id: Date.now().toString(),
        question,
        options,
        timeLimit: timeLimit || 60,
        answers: {},
        active: true,
        createdAt: new Date(),
        createdBy: teacher.name
      };

      activePoll.current = poll;

      // Save poll to history
      pollHistory.push(poll);

      // Broadcast new poll to all clients
      io.emit('poll:new', poll);

      // Set timer to end poll automatically
      setTimeout(() => {
        if (activePoll.current && activePoll.current.id === poll.id) {
          activePoll.current.active = false;
          io.emit('poll:ended', activePoll.current);
        }
      }, poll.timeLimit * 1000);
    });

    // Student submits answer
    socket.on('poll:answer', ({ pollId, answer }) => {
      const student = activeUsers.get(socket.id);

      if (!student || student.role !== 'student') {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      if (!activePoll.current || activePoll.current.id !== pollId) {
        return socket.emit('error', { message: 'Poll not found or inactive' });
      }

      // Save student's answer
      activePoll.current.answers[student.name] = answer;

      // Notify everyone about new answer
      io.emit('poll:answered', {
        pollId,
        student: student.name,
        results: calculateResults(activePoll.current)
      });

      // Check if all students have answered
      const students = Array.from(activeUsers.values())
        .filter(user => user.role === 'student');

      const allAnswered = students.every(student =>
        student.name in activePoll.current.answers
      );

      if (allAnswered) {
        activePoll.current.active = false;
        io.emit('poll:allAnswered', activePoll.current);
      }
    });

    // Teacher requests poll history
    socket.on('poll:history', () => {
      const teacher = activeUsers.get(socket.id);

      if (!teacher || teacher.role !== 'teacher') {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      socket.emit('poll:historyData', pollHistory);
    });

    // Teacher kicks a student
    socket.on('student:kick', (studentName) => {
      const teacher = activeUsers.get(socket.id);

      if (!teacher || teacher.role !== 'teacher') {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      const studentSocketId = userSockets.get(studentName);
      if (studentSocketId) {
        io.to(studentSocketId).emit('you:kicked');

        // Remove student from active users
        activeUsers.delete(studentSocketId);
        userSockets.delete(studentName);

        // Notify everyone
        io.emit('student:kicked', { studentName });
      }
    });

    // Chat message
    socket.on('chat:message', (message) => {
      const user = activeUsers.get(socket.id);

      if (!user) {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      const chatMessage = {
        sender: user.name,
        role: user.role,
        text: message,
        timestamp: new Date()
      };

      // Save to chat history
      chatMessages.push(chatMessage);

      // Broadcast to everyone
      io.emit('chat:newMessage', chatMessage);
    });

    // Disconnect
    socket.on('disconnect', () => {
      const user = activeUsers.get(socket.id);

      if (user) {
        console.log(`${user.role} ${user.name} disconnected`);

        activeUsers.delete(socket.id);
        userSockets.delete(user.name);

        // Notify everyone
        io.emit('user:left', { id: socket.id, name: user.name, role: user.role });
      }
    });
  });

  // Helper function to calculate poll results
  function calculateResults(poll) {
    const results = {};

    poll.options.forEach(option => {
      results[option] = 0;
    });

    Object.values(poll.answers).forEach(answer => {
      if (results[answer] !== undefined) {
        results[answer]++;
      }
    });

    // Calculate percentages
    const total = Object.values(results).reduce((sum, count) => sum + count, 0);

    if (total > 0) {
      Object.keys(results).forEach(option => {
        const percentage = Math.round((results[option] / total) * 100);
        results[option] = {
          count: results[option],
          percentage
        };
      });
    }

    return results;
  }
};
