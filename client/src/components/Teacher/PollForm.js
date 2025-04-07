import React, { useState } from 'react';

function PollForm({ onSubmit, disabled }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timeLimit, setTimeLimit] = useState(60);
  const [error, setError] = useState('');

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!question.trim()) {
      return setError('Please enter a question');
    }
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      return setError('Please provide at least 2 options');
    }
    
    // Submit poll
    onSubmit({
      question,
      options: validOptions,
      timeLimit: parseInt(timeLimit, 10)
    });
    
    // Reset form
    setQuestion('');
    setOptions(['', '']);
    setTimeLimit(60);
    setError('');
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {disabled && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          You cannot create a new poll until the current poll is completed.
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="question" className="block text-gray-700 mb-2">Question</label>
        <input
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your question"
          disabled={disabled}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Options</label>
        {options.map((option, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Option ${index + 1}`}
              disabled={disabled}
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveOption(index)}
                className="ml-2 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                disabled={disabled}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        
        {options.length < 6 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            disabled={disabled}
          >
            Add Option
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="timeLimit" className="block text-gray-700 mb-2">Time Limit (seconds)</label>
        <input
          type="number"
          id="timeLimit"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
          min="10"
          max="300"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        disabled={disabled}
      >
        Create Poll
      </button>
    </form>
  );
}

export default PollForm;
