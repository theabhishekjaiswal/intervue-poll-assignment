import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

function StudentLogin() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { socket } = useSocket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!name.trim()) {
      setIsLoading(false);
      return setError('Please enter your name');
    }
    
    try {
      // Store user in local storage and context
      login({ name, role: 'student' });
      
      // Explicitly emit join event for the student
      if (socket) {
        socket.emit('join', { name, role: 'student' });
      }
      
      // Add a small delay to ensure socket connection is established
      setTimeout(() => {
        navigate('/student/dashboard');
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to join session. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6">
        <div className="flex justify-center mb-4">
          <span className="interview-poll-badge">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Interview Poll
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Let's Get Started</h1>
        <p className="text-gray-600 text-center mb-8">Enter your name to join the live polling session</p>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Session'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-blue-500 hover:underline"
          >
            Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentLogin;
