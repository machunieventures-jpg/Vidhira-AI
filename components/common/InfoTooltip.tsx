
import React from 'react';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  return (
    <div className="group relative flex items-center ml-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-lunar-grey/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-void-tint/90 backdrop-blur-md rounded-lg shadow-lg text-sm text-starlight text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 border border-lunar-grey/30 pointer-events-none">
        {text}
      </div>
    </div>
  );
};

export default InfoTooltip;