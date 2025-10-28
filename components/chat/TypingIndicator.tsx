import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="max-w-[80%] p-3 rounded-2xl bg-lunar-grey/20 rounded-bl-none">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-lunar-grey rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-lunar-grey rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-lunar-grey rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;