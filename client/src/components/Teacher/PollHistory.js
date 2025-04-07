import React from 'react';

function PollHistory({ polls }) {
  if (!polls || polls.length === 0) {
    return <div className="text-gray-600">No poll history available.</div>;
  }

  return (
    <div className="space-y-4">
      {polls.map((poll, pollIndex) => {
        // Calculate results
        const results = {};
        poll.options.forEach(option => {
          results[option] = 0;
        });
        
        if (poll.answers) {
          Object.values(poll.answers).forEach(answer => {
            if (results[answer] !== undefined) {
              results[answer]++;
            }
          });
        }
        
        const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
        
        return (
          <div key={poll.id || pollIndex} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{poll.question}</h3>
            <div className="text-sm text-gray-500 mb-2">
              Created: {new Date(poll.createdAt).toLocaleString()}
            </div>
            
            <div className="space-y-2">
              {poll.options.map((option, index) => {
                const count = results[option] || 0;
                const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                
                return (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">{option}</span>
                      <span className="text-gray-700">{count} votes ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              Total votes: {totalVotes}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PollHistory;
