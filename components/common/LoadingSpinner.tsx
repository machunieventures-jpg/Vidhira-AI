
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-starlight">
        <div className="w-16 h-16 border-4 border-lunar-grey border-t-cosmic-gold rounded-full animate-spin"></div>
        <p className="font-display text-xl text-cosmic-gold">Charting Your Cosmic Blueprint...</p>
        <p className="text-lunar-grey text-sm max-w-sm text-center">
            Vidhira is analyzing your unique vibrational signature to generate your personalized life report. Please wait a moment.
        </p>
    </div>
  );
};

export default LoadingSpinner;