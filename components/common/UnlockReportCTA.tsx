
import React from 'react';

interface UnlockReportCTAProps {
  onUnlock: () => void;
  isLoading: boolean;
}

const UnlockReportCTA: React.FC<UnlockReportCTAProps> = ({ onUnlock, isLoading }) => {
  return (
    <div className="bg-gradient-to-tr from-cosmic-gold/10 to-transparent p-6 rounded-2xl border-2 border-dashed border-cosmic-gold/50 text-center my-8 animate-fade-in">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cosmic-gold/10 border-2 border-cosmic-gold/30 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cosmic-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold font-display text-starlight">Unlock Your Full Blueprint</h3>
      <p className="text-lunar-grey mt-2 mb-6 max-w-md mx-auto">You are viewing a summarized report. Unlock the complete 10-pillar analysis for deep, actionable insights into your destiny.</p>
      <button
        onClick={onUnlock}
        disabled={isLoading}
        className="bg-cosmic-gold text-deep-void font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cosmic-gold/20 hover:shadow-[0_0_20px_var(--lucky-color-glow)] disabled:bg-lunar-grey disabled:scale-100 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Unlocking...' : 'Unlock Full Report ($5.00)'}
      </button>
    </div>
  );
};

export default UnlockReportCTA;