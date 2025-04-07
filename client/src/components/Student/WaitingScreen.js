import React from 'react';

function WaitingScreen() {
  return (
    <div className="bg-white shadow rounded-lg p-6 text-center">
      <h2 className="text-lg font-medium mb-4">Waiting for Teacher</h2>
      <div className="animate-pulse flex flex-col items-center">
        <div className="rounded-full bg-blue-100 h-24 w-24 flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-600">Please wait for the teacher to start a poll...</p>
      </div>
    </div>
  );
}

export default WaitingScreen;
