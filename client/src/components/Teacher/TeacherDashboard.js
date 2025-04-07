import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { createPoll, getPollHistory, kickStudent } from '../../utils/socketUtils';
import PollForm from './PollForm';
import PollResults from '../Shared/PollResults';
import StudentList from './StudentList';
import ChatBox from '../Shared/ChatBox';
import PollHistory from './PollHistory';

function TeacherDashboard() {
  const { socket } = useSocket();
  const { user, logout } = useAuth();
  const [currentPoll, setCurrentPoll] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [students, setStudents] = useState([]);
  const [pollHistory, setPollHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);

  // In the useEffect hook, add this code to request connected students
// immediately after connecting and whenever a student joins or leaves

useEffect(() => {
  if (!socket) return;

  // Listen for new poll
  socket.on('poll:new', (poll) => {
    setCurrentPoll(poll);
    setPollResults(null);
  });

  // Listen for poll answers
  socket.on('poll:answered', ({ pollId, student, results }) => {
    setPollResults(results);
  });

  // Listen for poll ended
  socket.on('poll:ended', (poll) => {
    setCurrentPoll({ ...poll, active: false });
  });

  // Listen for all students answered
  socket.on('poll:allAnswered', (poll) => {
    setCurrentPoll({ ...poll, active: false });
  });

  // Listen for poll history data
  socket.on('poll:historyData', (polls) => {
    console.log("Received poll history:", polls);
    setPollHistory(polls);
  });

  // Listen for student joins
  socket.on('user:joined', (user) => {
    console.log("User joined:", user);
    if (user.role === 'student') {
      // Check if student already exists in the list
      setStudents((prev) => {
        const exists = prev.some(s => s.id === user.id);
        if (!exists) {
          return [...prev, user];
        }
        return prev;
      });
      
      // Request updated student list
      socket.emit('getConnectedStudents');
    }
  });

  // Listen for student leaves
  socket.on('user:left', (user) => {
    if (user.role === 'student') {
      setStudents((prev) => prev.filter(s => s.id !== user.id));
      
      // Request updated student list
      socket.emit('getConnectedStudents');
    }
  });

  // Listen for student kicked
  socket.on('student:kicked', ({ studentName }) => {
    setStudents((prev) => prev.filter(s => s.name !== studentName));
  });

  // Get poll history on load
  getPollHistory(socket);

  // Request current connected students when component mounts
  socket.emit('getConnectedStudents');

  // Listen for connected students list
  socket.on('connectedStudents', (connectedStudents) => {
    console.log("Connected students:", connectedStudents);
    setStudents(connectedStudents);
  });

  return () => {
    socket.off('poll:new');
    socket.off('poll:answered');
    socket.off('poll:ended');
    socket.off('poll:allAnswered');
    socket.off('poll:historyData');
    socket.off('user:joined');
    socket.off('user:left');
    socket.off('student:kicked');
    socket.off('connectedStudents');
  };
}, [socket]);

  const handleCreatePoll = (pollData) => {
    createPoll(socket, pollData);
  };

  const handleKickStudent = (studentName) => {
    kickStudent(socket, studentName);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button 
              onClick={() => setShowChat(!showChat)}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
            >
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </button>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Create New Poll</h2>
              <PollForm onSubmit={handleCreatePoll} disabled={currentPoll && currentPoll.active} />
            </div>

            {currentPoll && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">
                  Current Poll {!currentPoll.active && '(Ended)'}
                </h2>
                <div className="mb-4">
                  <h3 className="font-medium">Question:</h3>
                  <p className="text-gray-700">{currentPoll.question}</p>
                </div>
                <PollResults results={pollResults} options={currentPoll.options} />
              </div>
            )}

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Poll History</h2>
              <PollHistory polls={pollHistory} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Connected Students ({students.length})</h2>
              <StudentList students={students} onKickStudent={handleKickStudent} />
            </div>

            {showChat && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Chat</h2>
                <ChatBox socket={socket} user={user} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeacherDashboard;
