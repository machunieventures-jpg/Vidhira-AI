import React from 'react';

interface InterpretationTooltipProps {
  isLoading: boolean;
  content: string;
  position: { top: number; left: number };
  number: number;
  onClose: () => void;
}

const InterpretationTooltip: React.FC<InterpretationTooltipProps> = ({
  isLoading,
  content,
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
      className="fixed z-50 w-64 p-4 bg-deep-purple/80 backdrop-blur-xl rounded-lg shadow-2xl border border-cool-cyan/50 text-white animate-fade-in-fast"
      style={style}
    >
      <div className="flex justify-between items-center mb-2">
        <h5 className="font-bold text-lg font-display text-accent-gold">Number {number}</h5>
        <button onClick={onClose} className="text-white/50 hover:text-white text-2xl leading-none">&times;</button>
      </div>
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-cool-cyan border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-cool-cyan/80">Consulting...</span>
        </div>
      ) : (
        <p className="text-sm text-white/90">{content}</p>
      )}
    </div>
  );
};

export default InterpretationTooltip;
