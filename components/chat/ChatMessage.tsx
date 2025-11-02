import React from 'react';
import type { ChatMessage } from '../../types';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-lg">
           ✨
        </div>
      )}
      <div
        className={`max-w-[80%] p-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-[--cosmic-purple] to-[--gold-accent] text-white rounded-br-none'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-gray-500 dark:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
        </div>
      )}
    </div>
  );
};

export default ChatMessageBubble;
