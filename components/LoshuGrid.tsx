
import React, { useState, useEffect, useCallback } from 'react';
import { getLoshuNumberInterpretation } from '../services/geminiService';
import type { UserData } from '../types';
import InterpretationTooltip from './common/InterpretationTooltip';

interface LoshuGridProps {
  grid: (number | null)[][];
  missingNumbers: number[];
  overloadedNumbers: number[];
  userData: UserData;
  birthNumber: number;
  destinyNumber: number;
}

const LoshuGrid: React.FC<LoshuGridProps> = ({ grid, missingNumbers, overloadedNumbers, userData, birthNumber, destinyNumber }) => {
  const [activeNumber, setActiveNumber] = useState<{num: number, isMissing: boolean} | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [potentialInterpretation, setPotentialInterpretation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{top: number, left: number} | null>(null);

  const handleCloseTooltip = useCallback(() => {
      setActiveNumber(null);
      setTooltipPosition(null);
      setInterpretation('');
      setPotentialInterpretation(null);
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
      setPotentialInterpretation(null);

      try {
          if (isMissing) {
              const [challenge, potential] = await Promise.all([
                  getLoshuNumberInterpretation(num, true, userData.fullName, userData.dob, userData.language),
                  getLoshuNumberInterpretation(num, false, userData.fullName, userData.dob, userData.language)
              ]);
              setInterpretation(challenge);
              setPotentialInterpretation(potential);
          } else {
              const result = await getLoshuNumberInterpretation(num, false, userData.fullName, userData.dob, userData.language);
              setInterpretation(result);
          }
      } catch (error) {
          setInterpretation("Could not retrieve interpretation. Please try again.");
          console.error(error);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    if (!activeNumber) return;
    const handleScroll = () => { handleCloseTooltip(); };
    window.addEventListener('scroll', handleScroll, true);
    return () => { window.removeEventListener('scroll', handleScroll, true); };
  }, [activeNumber, handleCloseTooltip]);

  return (
    <>
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
        {/* Left: Grid */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-void-tint rounded-lg border border-lunar-grey/50 self-center md:self-start">
          {grid.flat().map((cell, index) => {
            const isCellActive = cell && activeNumber?.num === cell && !activeNumber?.isMissing;
            return (
                <div
                key={index}
                className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-3xl font-bold rounded-md bg-deep-void/50 ${cell ? 'cursor-pointer hover:bg-lunar-grey/20 transform transition-transform hover:scale-110' : ''} ${isCellActive ? 'animate-scale-pulse' : ''}`}
                onClick={(e) => cell && handleNumberClick(cell, false, e)}
                >
                {cell ? <span className="text-starlight">{cell}</span> : <span className="text-starlight/20">-</span>}
                </div>
            )
          })}
        </div>
        
        {/* Right: Core Matrix Analysis */}
        <div className="flex-1 space-y-6">
            <div>
                <h4 className="text-xl font-bold text-cosmic-gold font-display">Core Identifiers</h4>
                <div className="flex gap-4 mt-3">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-void-tint to-deep-void rounded-full text-starlight font-bold text-4xl border-2 border-cosmic-gold/50">
                            {birthNumber}
                        </div>
                        <span className="text-sm text-lunar-grey mt-2">Birth Number</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-void-tint to-deep-void rounded-full text-starlight font-bold text-4xl border-2 border-cosmic-gold/50">
                            {destinyNumber}
                        </div>
                        <span className="text-sm text-lunar-grey mt-2">Destiny Number</span>
                    </div>
                </div>
            </div>
            <div>
                <h4 className="text-xl font-bold text-cosmic-gold font-display">Missing Numbers</h4>
                {missingNumbers.length > 0 ? (
                    <>
                    <p className="text-lunar-grey mt-1 text-sm">Areas for growth. Click a number to learn its potential.</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                        {missingNumbers.map(num => {
                        const isMissingActive = activeNumber?.num === num && activeNumber?.isMissing;
                        return (
                            <div 
                                key={num} 
                                className={`w-10 h-10 flex items-center justify-center bg-cosmic-gold/10 border border-cosmic-gold/50 rounded-full text-cosmic-gold font-bold cursor-pointer hover:bg-cosmic-gold/20 transform transition-transform hover:scale-110 ${isMissingActive ? 'animate-scale-pulse' : ''}`}
                                onClick={(e) => handleNumberClick(num, true, e)}
                                >
                                {num}
                            </div>
                        )
                        })}
                    </div>
                    </>
                ) : (
                    <p className="text-lunar-grey mt-1">You have no missing numbers, indicating a balanced energetic blueprint.</p>
                )}
            </div>
             <div>
                <h4 className="text-xl font-bold text-cosmic-gold font-display">Overloaded Numbers</h4>
                {overloadedNumbers.length > 0 ? (
                    <>
                    <p className="text-lunar-grey mt-1 text-sm">Energies that are strongly present, representing core strengths.</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                        {overloadedNumbers.map(num => (
                            <div 
                                key={num} 
                                className="w-10 h-10 flex items-center justify-center bg-lunar-grey/10 border border-lunar-grey/50 rounded-full text-lunar-grey font-bold"
                                >
                                {num}
                            </div>
                        ))}
                    </div>
                    </>
                ) : (
                    <p className="text-lunar-grey mt-1">No single number is overloaded, suggesting a versatile energy distribution.</p>
                )}
            </div>
        </div>
      </div>
      {activeNumber && tooltipPosition && (
        <>
            <div className="fixed inset-0 z-40" onClick={handleCloseTooltip}></div>
            <InterpretationTooltip
              isLoading={isLoading}
              content={interpretation}
              potentialContent={potentialInterpretation}
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