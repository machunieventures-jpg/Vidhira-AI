import React from 'react';
import type { ChatMessage } from '../../types';

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] p-3 rounded-2xl text-white ${
          isUser
            ? 'bg-aurora-pink rounded-br-none'
            : 'bg-white/10 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message.text}</p>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
