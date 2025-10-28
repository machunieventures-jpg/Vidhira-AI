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
        <div className="w-8 h-8 rounded-full bg-lunar-grey/20 flex items-center justify-center flex-shrink-0">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cosmic-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
      )}
      <div
        className={`max-w-[80%] p-3 rounded-2xl ${
          isUser
            ? 'bg-cosmic-gold text-deep-void rounded-br-none'
            : 'bg-lunar-grey/20 text-starlight rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-cosmic-gold/20 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cosmic-gold" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
        </div>
      )}
    </div>
  );
};

export default ChatMessageBubble;