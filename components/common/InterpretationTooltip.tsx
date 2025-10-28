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
      className="fixed z-50 w-64 p-4 bg-celestial-sapphire/80 backdrop-blur-xl rounded-lg shadow-2xl border border-cool-cyan/50 text-white animate-fade-in-fast"
      style={style}
    >
      <div className="flex justify-between items-center mb-2">
        <h5 className="font-bold text-lg font-display text-galactic-silver">Number {number}</h5>
        <button onClick={onClose} className="text-white/50 hover:text-white text-2xl leading-none">&times;</button>
      </div>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-cool-cyan border-t-celestial-sapphire rounded-full animate-spin"></div>
          <span className="text-sm text-cool-cyan/80">Consulting the stars...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {potentialContent ? (
            <>
              <div>
                <h6 className="text-sm font-semibold text-aurora-pink/80">Challenge (As a Missing Number)</h6>
                <p className="text-sm text-white/90">{content}</p>
              </div>
              <div>
                <h6 className="text-sm font-semibold text-cool-cyan/80">Potential (If Cultivated)</h6>
                <p className="text-sm text-white/90">{potentialContent}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-white/90">{content}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default InterpretationTooltip;