import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from './components/Auth/RoleSelection';
import StudentLogin from './components/Auth/StudentLogin';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import StudentDashboard from './components/Student/StudentDashboard';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';

function App() {
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    // Reconnect socket if user refreshes the page
    if (user && socket) {
      console.log('Reconnecting user:', user.name, user.role);
      socket.emit('join', { name: user.name, role: user.role });
    }
  }, [user, socket]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route 
          path="/teacher/dashboard" 
          element={
            user && user.role === 'teacher' ? 
              <TeacherDashboard /> : 
              <Navigate to="/" />
          } 
        />
        <Route 
          path="/student/dashboard" 
          element={
            user && user.role === 'student' ? 
              <StudentDashboard /> : 
              <Navigate to="/" />
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
