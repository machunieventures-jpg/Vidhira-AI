import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 dark:bg-chandra-grey/20 rounded-bl-none">
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-gray-500 dark:bg-chandra-grey rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-500 dark:bg-chandra-grey rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-500 dark:bg-chandra-grey rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;