export const createPoll = (socket, { question, options, timeLimit }) => {
  if (!socket) return;
  
  socket.emit('poll:create', { question, options, timeLimit });
};

export const answerPoll = (socket, { pollId, answer }) => {
  if (!socket) return;
  
  socket.emit('poll:answer', { pollId, answer });
};

export const getPollHistory = (socket) => {
  if (!socket) return;
  
  socket.emit('poll:history');
};

export const getConnectedStudents = (socket) => {
  if (!socket) return;
  
  socket.emit('getConnectedStudents');
};

export const kickStudent = (socket, studentName) => {
  if (!socket) return;
  
  socket.emit('student:kick', studentName);
};

export const sendChatMessage = (socket, message) => {
  if (!socket) return;
  
  socket.emit('chat:message', message);
};
