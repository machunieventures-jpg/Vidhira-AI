
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-16 h-16 border-4 border-cool-cyan border-t-celestial-sapphire rounded-full animate-spin"></div>
        <p className="font-display text-xl text-aurora-pink">Decoding Your Destiny...</p>
        <p className="text-cool-cyan text-sm max-w-sm text-center">
            Vidhira is consulting the cosmos and analyzing your unique vibrational signature. Please wait a moment.
        </p>
    </div>
  );
};

export default LoadingSpinner;