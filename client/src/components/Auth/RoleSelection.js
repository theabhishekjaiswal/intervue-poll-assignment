import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

function RoleSelection() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { socket } = useSocket();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole === 'teacher') {
      login({ name: 'Teacher', role: 'teacher' });
      
      // Explicitly emit join event for the teacher
      if (socket) {
        socket.emit('join', { name: 'Teacher', role: 'teacher' });
      }
      
      navigate('/teacher/dashboard');
    } else if (selectedRole === 'student') {
      navigate('/student/login');
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
            Intervue Poll
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Welcome to the Live Polling System</h1>
        <p className="text-gray-600 text-center mb-8">Please select the role that best describes you to begin using the live polling system</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div 
            onClick={() => handleRoleSelect('student')}
            className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
              selectedRole === 'student' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <h2 className="text-lg font-medium mb-2">I'm a Student</h2>
            <p className="text-sm text-gray-500">Join a polling session and submit your answers</p>
          </div>
          
          <div 
            onClick={() => handleRoleSelect('teacher')}
            className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
              selectedRole === 'teacher' ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <h2 className="text-lg font-medium mb-2">I'm a Teacher</h2>
            <p className="text-sm text-gray-500">Create polls and view live results in real-time</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button 
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`w-full py-2 px-4 rounded-lg transition-colors ${
              selectedRole 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
