import React, { useState } from 'react';

function PollQuestion({ question, options, onAnswer, disabled }) {
  const [selectedOption, setSelectedOption] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedOption) {
      onAnswer(selectedOption);
    }
  };

  return (
    <div>
      <h3 className="font-medium mb-2">{question}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-2 mb-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                id={`option-${index}`}
                name="poll-option"
                value={option}
                checked={selectedOption === option}
                onChange={() => setSelectedOption(option)}
                className="mr-2"
                disabled={disabled}
              />
              <label htmlFor={`option-${index}`} className="text-gray-700">
                {option}
              </label>
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!selectedOption || disabled}
        >
          Submit Answer
        </button>
        
        {disabled && (
          <p className="text-red-500 mt-2">Time's up! You can no longer submit an answer.</p>
        )}
      </form>
    </div>
  );
}

export default PollQuestion;
