import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../../utils/socketUtils';
import axios from 'axios';

function ChatBox({ socket, user }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // // Fetch chat history
    // const fetchChatHistory = async () => {
    //   try {
    //     const response = await axios.get('/api/chat');
    //     setMessages(response.data);
    //   } catch (error) {
    //     console.error('Error fetching chat history:', error);
    //   }
    // };
    const fetchChatHistory = async () => {
      try {
        const response = await axios.get('/api/chat');
        const data = response.data;
    
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.warn('Chat history is not an array:', data);
          setMessages([]); // fallback to empty chat
        }
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setMessages([]); // prevent map crash if request fails
      }
    };
    

    fetchChatHistory();

    // Listen for new messages
    if (socket) {
      socket.on('chat:newMessage', (message) => {
        setMessages((prev) => [...prev, message]);
      });
    }

    return () => {
      if (socket) {
        socket.off('chat:newMessage');
      }
    };
  }, [socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    sendChatMessage(socket, message);
    setMessage('');
  };

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`p-2 rounded-lg max-w-xs ${
              msg.sender === user.name 
                ? 'ml-auto bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            <div className="text-xs font-medium mb-1">
              {msg.sender} ({msg.role})
            </div>
            <div>{msg.text}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-r-lg hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
