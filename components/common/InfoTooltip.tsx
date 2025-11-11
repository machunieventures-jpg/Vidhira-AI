import React from 'react';

interface InfoTooltipProps {
  text: string;
  id: string; // Required for ARIA attributes
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text, id }) => {
  return (
    <div className="group relative flex items-center ml-2">
      <button 
        type="button" 
        aria-describedby={id}
        className="flex items-center p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--cosmic-purple] dark:focus:ring-offset-[--deep-space]"
        aria-label="More information"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <div 
        id={id}
        role="tooltip"
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white/90 dark:bg-[--deep-space]/90 backdrop-blur-md rounded-lg shadow-lg text-sm text-[--cosmic-blue] dark:text-[--stardust] text-center opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-opacity duration-300 z-10 border border-gray-200 dark:border-gray-700/30 pointer-events-none"
      >
        {text}
      </div>
    </div>
  );
};

export default InfoTooltip;