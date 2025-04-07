import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { answerPoll } from '../../utils/socketUtils';
import PollQuestion from './PollQuestion';
import PollResults from '../Shared/PollResults';
import ChatBox from '../Shared/ChatBox';
import WaitingScreen from './WaitingScreen';

function StudentDashboard() {
  const { socket } = useSocket();
  const { user, logout } = useAuth();
  const [currentPoll, setCurrentPoll] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [pollResults, setPollResults] = useState(null);
  const [waitingForTeacher, setWaitingForTeacher] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for new poll
    socket.on('poll:new', (poll) => {
      setCurrentPoll(poll);
      setAnswered(false);
      setPollResults(null);
      setWaitingForTeacher(false);
      
      // Set timer
      if (poll.timeLimit) {
        setTimeLeft(poll.timeLimit);
        const countdown = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(countdown);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setTimer(countdown);
      }
    });

    // Listen for current poll state
    socket.on('poll:current', (poll) => {
      setCurrentPoll(poll);
      // Check if student already answered this poll
      if (poll.answers && poll.answers[user.name]) {
        setAnswered(true);
        setPollResults(calculateResults(poll));
      }
    });

    // Listen for poll answers
    socket.on('poll:answered', ({ pollId, results }) => {
      if (answered) {
        setPollResults(results);
      }
    });

    // Listen for poll ended
    socket.on('poll:ended', (poll) => {
      setCurrentPoll({ ...poll, active: false });
      setPollResults(calculateResults(poll));
      if (timer) clearInterval(timer);
    });

    // Listen for all students answered
    socket.on('poll:allAnswered', (poll) => {
      setCurrentPoll({ ...poll, active: false });
      setPollResults(calculateResults(poll));
      if (timer) clearInterval(timer);
    });

    // Listen for waiting for teacher
    socket.on('waitForTeacher', () => {
      setWaitingForTeacher(true);
    });

    // Listen for being kicked
    socket.on('you:kicked', () => {
      logout();
    });

    return () => {
      socket.off('poll:new');
      socket.off('poll:current');
      socket.off('poll:answered');
      socket.off('poll:ended');
      socket.off('poll:allAnswered');
      socket.off('waitForTeacher');
      socket.off('you:kicked');
      if (timer) clearInterval(timer);
    };
  }, [socket, user, answered, timer, logout]);

  const handleAnswer = (answer) => {
    if (!currentPoll || !currentPoll.active) return;
    
    answerPoll(socket, { pollId: currentPoll.id, answer });
    setAnswered(true);
  };

  const calculateResults = (poll) => {
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
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
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
          <div className="lg:col-span-2">
            {waitingForTeacher ? (
              <WaitingScreen />
            ) : currentPoll ? (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">
                  Current Poll {!currentPoll.active && '(Ended)'}
                </h2>
                
                {timeLeft !== null && timeLeft > 0 && !answered && (
                  <div className="mb-4 text-center">
                    <span className="text-red-500 font-medium">Time remaining: {timeLeft} seconds</span>
                  </div>
                )}
                
                {!answered && currentPoll.active ? (
                  <PollQuestion 
                    question={currentPoll.question} 
                    options={currentPoll.options} 
                    onAnswer={handleAnswer}
                    disabled={timeLeft === 0}
                  />
                ) : (
                  <div>
                    <div className="mb-4">
                      <h3 className="font-medium">Question:</h3>
                      <p className="text-gray-700">{currentPoll.question}</p>
                    </div>
                    <PollResults results={pollResults} options={currentPoll.options} />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center">
                <h2 className="text-lg font-medium mb-4">No Active Poll</h2>
                <p className="text-gray-600">Wait for the teacher to start a new poll.</p>
              </div>
            )}
          </div>
          
          {showChat && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Chat</h2>
              <ChatBox socket={socket} user={user} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
