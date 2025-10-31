import React from 'react';

interface DefinitionTooltipProps {
  children: React.ReactNode;
  definition: string;
}

const DefinitionTooltip: React.FC<DefinitionTooltipProps> = ({ children, definition }) => {
  return (
    <span className="relative group inline-block">
      <span className="border-b border-dotted border-lunar-grey/50 cursor-help">
        {children}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-void-tint/90 backdrop-blur-md rounded-lg shadow-lg text-sm text-starlight text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border border-lunar-grey/30 pointer-events-none">
        {definition}
      </div>
    </span>
  );
};

export default DefinitionTooltip;
