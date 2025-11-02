import React from 'react';

interface InterpretationTooltipProps {
  isLoading: boolean;
  content: string;
  potentialContent?: string | null;
  position: { top: number; left: number };
  number: number;
  onClose: () => void;
}

const InterpretationTooltip: React.FC<InterpretationTooltipProps> = ({
  isLoading,
  content,
  potentialContent,
  position,
  number,
  onClose,
}) => {
  const style = {
      top: `${position.top + 8}px`,
      left: `${position.left}px`,
      transform: 'translateX(-50%)', // Center the tooltip
  };

  return (
    <div
      className="fixed z-50 w-64 p-4 bg-white/80 dark:bg-night-sky/80 backdrop-blur-xl rounded-lg shadow-2xl border border-suryansh-gold/50 text-gray-800 dark:text-star-white animate-fade-in-fast"
      style={style}
    >
      <div className="flex justify-between items-center mb-2">
        <h5 className="font-bold text-lg font-display text-gray-900 dark:text-star-white">Number {number}</h5>
        <button onClick={onClose} className="text-gray-500 dark:text-star-white/50 hover:text-gray-900 dark:hover:text-star-white text-2xl leading-none">&times;</button>
      </div>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-gray-400 dark:border-chandra-grey border-t-suryansh-gold rounded-full animate-spin"></div>
          <span className="text-sm text-gray-600 dark:text-chandra-grey">Consulting...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {potentialContent ? (
            <>
              <div>
                <h6 className="text-sm font-semibold text-suryansh-gold/80">Challenge (As a Missing Number)</h6>
                <p className="text-sm text-gray-800/90 dark:text-star-white/90">{content}</p>
              </div>
              <hr className="border-gray-200 dark:border-chandra-grey/20" />
              <div>
                <h6 className="text-sm font-semibold text-gray-800 dark:text-star-white">Potential (If Cultivated)</h6>
                <p className="text-sm text-gray-800/90 dark:text-star-white/90">{potentialContent}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-800/90 dark:text-star-white/90">{content}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InterpretationTooltip;