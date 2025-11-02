import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getLoshuNumberInterpretation, getCoreIdentifierInterpretation } from '../services/geminiService';
import type { UserData, LoshuAnalysisPillar } from '../types';
import InterpretationTooltip from './common/InterpretationTooltip';

interface LoshuGridProps {
  grid: (string | null)[][];
  missingNumbers: number[];
  overloadedNumbers: number[];
  userData: UserData;
  birthNumber: number;
  destinyNumber: number;
  elementalPlanes: LoshuAnalysisPillar['elementalPlanes'];
  isUnlocked: boolean;
}

// --- CONSTANTS & HELPERS ---
const numberToGridPosition: { [key: number]: { row: number, col: number } } = {
    4: { row: 0, col: 0 }, 9: { row: 0, col: 1 }, 2: { row: 0, col: 2 },
    3: { row: 1, col: 0 }, 5: { row: 1, col: 1 }, 7: { row: 1, col: 2 },
    8: { row: 2, col: 0 }, 1: { row: 2, col: 1 }, 6: { row: 2, col: 2 },
};

const positionToNumberMap = Object.fromEntries(
  Object.entries(numberToGridPosition).map(([num, pos]) => [`${pos.row}-${pos.col}`, Number(num)])
);


const planes = {
    mental: { name: 'Mental Plane', numbers: [4, 9, 2], description: 'Thinking, creativity, analysis.' },
    emotional: { name: 'Emotional Plane', numbers: [3, 5, 7], description: 'Intuition, spiritual depth.' },
    practical: { name: 'Practical Plane', numbers: [8, 1, 6], description: 'Grounding, material success.' },
    thought: { name: 'Thought Plane', numbers: [4, 3, 8], description: 'Ability to conceive ideas.' },
    will: { name: 'Will Plane', numbers: [9, 5, 1], description: 'Determination, patience.' },
    action: { name: 'Action Plane', numbers: [2, 7, 6], description: 'Capacity for dynamic action.' },
    determination: { name: 'Determination Plane', numbers: [4, 5, 6], description: 'Resolve and success.' },
    spiritual: { name: 'Spiritual Plane', numbers: [2, 5, 8], description: 'Inner guidance connection.' },
};

// --- SUB-COMPONENTS ---
const PlaneInterpretationCard: React.FC<{title: string, status: string, interpretation: string}> = ({title, status, interpretation}) => (
    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
        <div className="flex justify-between items-start mb-2">
            <span className="font-semibold text-gray-800 dark:text-gray-100">{title}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'Complete' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                {status}
            </span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">{interpretation}</p>
    </div>
);

// --- MAIN COMPONENT ---
const LoshuGrid: React.FC<LoshuGridProps> = ({ grid, missingNumbers, overloadedNumbers, userData, birthNumber, destinyNumber, elementalPlanes, isUnlocked }) => {
  const [activeNumber, setActiveNumber] = useState<{num: number, isMissing: boolean} | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [potentialInterpretation, setPotentialInterpretation] = useState<string | null>(null);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{top: number, left: number} | null>(null);

  const handleCloseTooltip = useCallback(() => {
      setActiveNumber(null);
      setTooltipPosition(null);
      setInterpretation('');
      setPotentialInterpretation(null);
  }, []);

  const handleNumberClick = async (num: number, isMissing: boolean, event: React.MouseEvent) => {
    if (activeNumber && activeNumber.num === num && activeNumber.isMissing === isMissing) {
        handleCloseTooltip();
        return;
    }

    handleCloseTooltip(); // Close any existing tooltip first
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setActiveNumber({ num, isMissing });
    setTooltipPosition({ top: rect.bottom + window.scrollY, left: rect.left + rect.width / 2 + window.scrollX });
    setIsLoadingInterpretation(true);

    try {
        const result = await getLoshuNumberInterpretation(num, isMissing, userData.fullName, userData.dob, userData.language);
        setInterpretation(result);
        if (isMissing) {
             const potentialResult = await getLoshuNumberInterpretation(num, false, userData.fullName, userData.dob, userData.language);
            setPotentialInterpretation(potentialResult);
        }
    } catch (error) {
        console.error('Error fetching number interpretation:', error);
        setInterpretation('Could not retrieve interpretation at this time.');
    } finally {
        setIsLoadingInterpretation(false);
    }
  };
  
  const presentNumbers = useMemo(() => {
    const all = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    missingNumbers.forEach(n => all.delete(n));
    return all;
  }, [missingNumbers]);

  const isPlaneComplete = useCallback((planeNumbers: number[]) => planeNumbers.every(num => presentNumbers.has(num)), [presentNumbers]);

  return (
    <>
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
        {/* Left: Grid */}
        <div className="relative w-[256px] h-[256px] self-center md:self-start flex-shrink-0">
            <div className="absolute inset-0 grid grid-cols-3 gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {grid.flat().map((cellContent, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                const numberForCell = positionToNumberMap[`${row}-${col}`];
                const isCellActive = cellContent && activeNumber?.num === numberForCell && !activeNumber?.isMissing;
                
                return (
                    <div
                        key={index}
                        className={`w-full h-full flex items-center justify-center font-bold rounded-md bg-white dark:bg-gray-900 shadow-inner ${cellContent ? 'cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/50' : ''} ${isCellActive ? 'ring-2 ring-[--cosmic-purple]' : ''}`}
                        onClick={(e) => cellContent && handleNumberClick(numberForCell, false, e)}
                    >
                        {cellContent ? <span className={`${cellContent.length > 2 ? 'text-xl' : 'text-3xl'} text-gray-800 dark:text-gray-200`}>{cellContent}</span> : <span className="text-gray-300 dark:text-gray-600">-</span>}
                    </div>
                )
            })}
            </div>
        </div>
        
        {/* Right: Core Matrix Analysis */}
        <div className="flex-1 space-y-6">
            <div>
                <h4 className="text-xl font-bold gradient-text">Missing Numbers</h4>
                {missingNumbers.length > 0 ? (
                    <>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">Areas for growth. Click a number to learn its potential.</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                        {missingNumbers.map(num => (
                            <button 
                                key={num} 
                                className={`w-10 h-10 flex items-center justify-center bg-purple-100/50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-full text-[--cosmic-purple] font-bold cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transform transition-all duration-300 hover:scale-110 ${activeNumber?.num === num && activeNumber.isMissing ? 'ring-2 ring-[--cosmic-purple]' : ''}`}
                                onClick={(e) => handleNumberClick(num, true, e)}
                                >
                                {num}
                            </button>
                        ))}
                    </div>
                    </>
                ) : (
                    <p className="text-gray-600 dark:text-gray-300 mt-1">You have no missing numbers, indicating a balanced energetic blueprint.</p>
                )}
            </div>
             <div>
                <h4 className="text-xl font-bold gradient-text">Overloaded Numbers</h4>
                {overloadedNumbers.length > 0 ? (
                    <>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">Energies that are strongly present, representing core strengths.</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                        {overloadedNumbers.map(num => (
                            <button 
                                key={num} 
                                className={`w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-800 dark:text-gray-200 font-bold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transform transition-all duration-300 hover:scale-110 ${activeNumber?.num === num && !activeNumber.isMissing ? 'ring-2 ring-[--cosmic-purple]' : ''}`}
                                onClick={(e) => handleNumberClick(num, false, e)}
                                >
                                {num}
                            </button>
                        ))}
                    </div>
                    </>
                ) : (
                    <p className="text-gray-600 dark:text-gray-300 mt-1">No single number is overloaded, suggesting a versatile energy distribution.</p>
                )}
            </div>
        </div>
      </div>

       <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-bold gradient-text mb-4">Elemental Planes Analysis</h4>
             <div className="grid md:grid-cols-3 gap-4">
                <PlaneInterpretationCard
                    title="Mental Plane (4-9-2)"
                    status={isPlaneComplete(planes.mental.numbers) ? 'Complete' : 'Incomplete'}
                    interpretation={isUnlocked ? elementalPlanes.mental.content : elementalPlanes.mental.teaser}
                />
                 <PlaneInterpretationCard
                    title="Emotional Plane (3-5-7)"
                    status={isPlaneComplete(planes.emotional.numbers) ? 'Complete' : 'Incomplete'}
                    interpretation={isUnlocked ? elementalPlanes.emotional.content : elementalPlanes.emotional.teaser}
                />
                 <PlaneInterpretationCard
                    title="Practical Plane (8-1-6)"
                    status={isPlaneComplete(planes.practical.numbers) ? 'Complete' : 'Incomplete'}
                    interpretation={isUnlocked ? elementalPlanes.practical.content : elementalPlanes.practical.teaser}
                />
            </div>
        </div>
      
      {activeNumber && tooltipPosition && (
        <>
            <div className="fixed inset-0 z-40" onClick={handleCloseTooltip}></div>
            <InterpretationTooltip
              isLoading={isLoadingInterpretation}
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
