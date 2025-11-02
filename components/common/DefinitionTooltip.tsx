import React from 'react';

interface DefinitionTooltipProps {
  children: React.ReactNode;
  definition: string;
}

const DefinitionTooltip: React.FC<DefinitionTooltipProps> = ({ children, definition }) => {
  return (
    <span className="relative group inline-block">
      <span className="border-b border-dotted border-gray-500/50 dark:border-chandra-grey/50 cursor-help">
        {children}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white/90 dark:bg-night-sky/90 backdrop-blur-md rounded-lg shadow-lg text-sm text-gray-800 dark:text-star-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border border-gray-200 dark:border-chandra-grey/30 pointer-events-none">
        {definition}
      </div>
    </span>
  );
};

export default DefinitionTooltip;