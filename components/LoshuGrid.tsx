import React, { useState, useEffect, useCallback } from 'react';
import { getLoshuNumberInterpretation } from '../services/geminiService';
import type { UserData } from '../types';
import InterpretationTooltip from './common/InterpretationTooltip';

interface LoshuGridProps {
  grid: (number | null)[][];
  missingNumbers: number[];
  userData: UserData;
}

const LoshuGrid: React.FC<LoshuGridProps> = ({ grid, missingNumbers, userData }) => {
  const [activeNumber, setActiveNumber] = useState<{num: number, isMissing: boolean} | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{top: number, left: number} | null>(null);

  const handleCloseTooltip = useCallback(() => {
      setActiveNumber(null);
      setTooltipPosition(null);
      setInterpretation('');
  }, []);

  const handleNumberClick = async (num: number, isMissing: boolean, event: React.MouseEvent) => {
      event.stopPropagation();
      if (activeNumber?.num === num && activeNumber.isMissing === isMissing) {
          handleCloseTooltip();
          return;
      }

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipPosition({ top: rect.bottom + window.scrollY, left: rect.left + rect.width / 2 + window.scrollX });
      setActiveNumber({num, isMissing});
      setIsLoading(true);
      setInterpretation('');

      try {
          const result = await getLoshuNumberInterpretation(num, isMissing, userData.fullName, userData.dob);
          setInterpretation(result);
      } catch (error) {
          setInterpretation("Could not retrieve interpretation. Please try again.");
          console.error(error);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    if (!activeNumber) return;

    const handleScroll = () => {
      handleCloseTooltip();
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeNumber, handleCloseTooltip]);

  return (
    <>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="grid grid-cols-3 gap-2 p-2 bg-deep-purple/50 rounded-lg border border-cool-cyan/50">
          {grid.flat().map((cell, index) => {
            const isCellActive = cell && activeNumber?.num === cell && !activeNumber?.isMissing;
            return (
                <div
                key={index}
                className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-3xl font-bold rounded-md bg-white/10 ${cell ? 'cursor-pointer hover:bg-white/20 transform transition-transform hover:scale-110' : ''} ${isCellActive ? 'animate-scale-pulse' : ''}`}
                onClick={(e) => cell && handleNumberClick(cell, false, e)}
                >
                {cell ? <span className="text-accent-gold">{cell}</span> : <span className="text-white/20">-</span>}
                </div>
            )
          })}
        </div>
        <div>
          <h4 className="text-xl font-bold text-cool-cyan font-display">Missing Numbers</h4>
          {missingNumbers.length > 0 ? (
            <>
              <p className="text-white/80 mt-1">These numbers represent areas for growth. Click to learn more:</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {missingNumbers.map(num => {
                  const isMissingActive = activeNumber?.num === num && activeNumber?.isMissing;
                  return (
                    <div 
                        key={num} 
                        className={`w-10 h-10 flex items-center justify-center bg-aurora-pink rounded-full text-white font-bold cursor-pointer hover:bg-opacity-80 transform transition-transform hover:scale-110 ${isMissingActive ? 'animate-scale-pulse' : ''}`}
                        onClick={(e) => handleNumberClick(num, true, e)}
                        >
                        {num}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <p className="text-white/80 mt-1">You have no missing numbers! This indicates a balanced energetic blueprint.</p>
          )}
        </div>
      </div>
      {activeNumber && tooltipPosition && (
        <>
            <div className="fixed inset-0 z-40" onClick={handleCloseTooltip}></div>
            <InterpretationTooltip
              isLoading={isLoading}
              content={interpretation}
              position={tooltipPosition}
              number={activeNumber.num}
              onClose={handleCloseTooltip}
            />
        </>
      )}
    </>
  );
};

export default LoshuGrid;