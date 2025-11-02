import React from 'react';

interface UnlockReportCTAProps {
  onUnlock: () => void;
  isLoading: boolean;
}

const UnlockReportCTA: React.FC<UnlockReportCTAProps> = ({ onUnlock, isLoading }) => {
  return (
    <div className="bg-gradient-to-tr from-suryansh-gold/10 to-transparent p-6 rounded-2xl border-2 border-dashed border-suryansh-gold/50 text-center my-8 animate-fade-in no-print">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-suryansh-gold/10 border-2 border-suryansh-gold/30 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-suryansh-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold font-display text-stone-brown dark:text-manuscript-parchment">Unlock Your Full Soul Map</h3>
      <p className="text-stone-brown/80 dark:text-manuscript-parchment/80 mt-2 mb-6 max-w-md mx-auto">You are viewing a summarized report. Unlock the complete, in-depth analysis for a spiritual operating manual to your destiny.</p>
      <button
        onClick={onUnlock}
        disabled={isLoading}
        className="btn-neumorphic primary disabled:opacity-75 disabled:cursor-wait"
      >
        {isLoading ? 'Unlocking...' : 'Unlock Full Report ($9.99)'}
      </button>
    </div>
  );
};

export default UnlockReportCTA;