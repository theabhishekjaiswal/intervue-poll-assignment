import React from 'react';

function PollResults({ results, options }) {
  if (!results) {
    return <div className="text-gray-600">Waiting for results...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Results:</h3>
      
      {options.map((option, index) => {
        const result = results[option] || { count: 0, percentage: 0 };
        
        return (
          <div key={index} className="mb-2">
            <div className="flex justify-between mb-1">
              <span className="text-gray-700">{option}</span>
              <span className="text-gray-700">{result.count} votes ({result.percentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${result.percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PollResults;
