import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getLoshuNumberInterpretation, getKuaNumberInterpretation } from '../services/geminiService';
import type { UserData, LoshuAnalysisPillar } from '../types';
import InterpretationTooltip from './common/InterpretationTooltip';

interface LoshuGridProps {
  grid: (string | null)[][];
  missingNumbers: number[];
  overloadedNumbers: number[];
  userData: UserData;
  birthNumber: number;
  destinyNumber: number;
  kuaNumber: number;
  planes: LoshuAnalysisPillar['planes'];
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


const planesDef = {
    mental: { name: 'Mental Plane (Top Row)', numbers: [4, 9, 2] },
    emotional: { name: 'Emotional Plane (Mid Row)', numbers: [3, 5, 7] },
    practical: { name: 'Practical Plane (Bot Row)', numbers: [8, 1, 6] },
    thought: { name: 'Thought Plane (Left Col)', numbers: [4, 3, 8] },
    will: { name: 'Will Plane (Mid Col)', numbers: [9, 5, 1] },
    action: { name: 'Action Plane (Right Col)', numbers: [2, 7, 6] },
    determination: { name: 'Determination Plane (Diag)', numbers: [4, 5, 6] },
    spiritual: { name: 'Spiritual Plane (Diag)', numbers: [2, 5, 8] },
};

// --- SUB-COMPONENTS ---
const PlaneInterpretationCard: React.FC<{title: string, status: string, interpretation: string}> = ({title, status, interpretation}) => (
    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800 h-full">
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
const LoshuGrid: React.FC<LoshuGridProps> = ({ grid, missingNumbers, overloadedNumbers, userData, birthNumber, destinyNumber, kuaNumber, planes, isUnlocked }) => {
  const [activeNumber, setActiveNumber] = useState<{num: number, isMissing: boolean} | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [potentialInterpretation, setPotentialInterpretation] = useState<string | null>(null);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{top: number, left: number} | null>(null);
  const [tooltipTitle, setTooltipTitle] = useState<string>('');
  const interpretationCache = useRef<Record<string, string>>({});

  const handleCloseTooltip = useCallback(() => {
      setActiveNumber(null);
      setTooltipPosition(null);
      setInterpretation('');
      setPotentialInterpretation(null);
      setTooltipTitle('');
  }, []);

  const handleNumberClick = async (num: number, isMissing: boolean, event: React.MouseEvent) => {
    if (activeNumber && activeNumber.num === num && activeNumber.isMissing === isMissing) {
        handleCloseTooltip();
        return;
    }

    handleCloseTooltip(); // Close any existing tooltip first
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const isOverloaded = !isMissing && overloadedNumbers.includes(num);

    setActiveNumber({ num, isMissing });
    setTooltipTitle(isMissing ? `Missing Number ${num}`: (isOverloaded ? `Overloaded Number ${num}` : `Present Number ${num}`));
    setTooltipPosition({ top: rect.bottom + window.scrollY, left: rect.left + rect.width / 2 + window.scrollX });
    setIsLoadingInterpretation(true);

    const mainCacheKey = `loshu-${num}-${isMissing}-${isOverloaded}`;
    const potentialCacheKey = isMissing ? `loshu-${num}-potential` : null;

    try {
        // Fetch main interpretation if not cached
        if (interpretationCache.current[mainCacheKey]) {
            setInterpretation(interpretationCache.current[mainCacheKey]);
        } else {
            const result = await getLoshuNumberInterpretation(num, isMissing, isOverloaded, userData.fullName, userData.dob, userData.language);
            setInterpretation(result);
            interpretationCache.current[mainCacheKey] = result;
        }

        // Fetch potential interpretation if missing and not cached
        if (potentialCacheKey) {
            if (interpretationCache.current[potentialCacheKey]) {
                setPotentialInterpretation(interpretationCache.current[potentialCacheKey]);
            } else {
                const potentialResult = await getLoshuNumberInterpretation(num, false, false, userData.fullName, userData.dob, userData.language);
                setPotentialInterpretation(potentialResult);
                interpretationCache.current[potentialCacheKey] = potentialResult;
            }
        }
    } catch (error) {
        console.error('Error fetching number interpretation:', error);
        setInterpretation('Could not retrieve interpretation at this time.');
    } finally {
        setIsLoadingInterpretation(false);
    }
  };
  
  const handleKuaClick = async (event: React.MouseEvent) => {
    if (activeNumber && activeNumber.num === kuaNumber && tooltipTitle.startsWith('Kua')) {
        handleCloseTooltip();
        return;
    }
    handleCloseTooltip();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setActiveNumber({ num: kuaNumber, isMissing: false });
    setTooltipTitle(`Kua Number ${kuaNumber}`);
    setTooltipPosition({ top: rect.bottom + window.scrollY, left: rect.left + rect.width / 2 + window.scrollX });
    setIsLoadingInterpretation(true);
    setPotentialInterpretation(null);
    
    const cacheKey = `kua-${kuaNumber}`;

    // Check cache first
    if (interpretationCache.current[cacheKey]) {
        setInterpretation(interpretationCache.current[cacheKey]);
        setIsLoadingInterpretation(false);
        return;
    }

    try {
        const result = await getKuaNumberInterpretation(kuaNumber, userData.fullName, userData.gender, userData.language);
        setInterpretation(result);
        interpretationCache.current[cacheKey] = result;
    } catch (error) {
        console.error('Error fetching Kua interpretation:', error);
        setInterpretation('Could not retrieve Kua interpretation at this time.');
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
                const isKuaCell = numberForCell === kuaNumber;

                return (
                    <div
                        key={index}
                        className={`relative w-full h-full flex items-center justify-center font-bold rounded-md bg-white dark:bg-gray-900 shadow-inner transition-all duration-300
                            ${(cellContent || isKuaCell) ? 'cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/50' : ''}
                            ${isCellActive ? 'ring-2 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-800 ring-[--cosmic-purple]' : ''}
                            ${isKuaCell ? 'bg-green-100 dark:bg-green-900/40' : ''}
                        `}
                        onClick={(e) => {
                            if (isKuaCell) {
                                handleKuaClick(e);
                            } else if (cellContent) {
                                handleNumberClick(numberForCell, false, e);
                            }
                        }}
                    >
                        {cellContent ? <span className={`${cellContent.length > 2 ? 'text-xl' : 'text-3xl'} text-gray-800 dark:text-gray-200`}>{cellContent}</span> : <span className="text-gray-300 dark:text-gray-600">-</span>}
                        {isKuaCell && (
                            <div 
                                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-green-500 text-white text-xs font-bold rounded-full border-2 border-white dark:border-gray-800 shadow"
                                title={`Your Kua Number: ${kuaNumber}`}
                            >
                                {kuaNumber}
                            </div>
                        )}
                    </div>
                )
            })}
            </div>
        </div>
        
        {/* Right: Core Matrix Analysis */}
        <div className="flex-1 space-y-4">
            <div>
                <h4 className="text-xl font-bold gradient-text">Core Identifiers</h4>
                 <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-300">
                    <span className="w-4 h-4 rounded-md bg-green-100 dark:bg-green-900/40 border border-green-400"></span>
                    <span>- Your Kua Number's Cell</span>
                </div>
            </div>
            <div>
                <h5 className="font-semibold text-gray-700 dark:text-gray-200">Missing Numbers</h5>
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
                <h5 className="font-semibold text-gray-700 dark:text-gray-200">Overloaded Numbers</h5>
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
            <h4 className="text-xl font-bold gradient-text mb-4">The 8 Planes of Existence</h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(planesDef).map(([key, def]) => (
                    <PlaneInterpretationCard
                        key={key}
                        title={def.name}
                        status={isPlaneComplete(def.numbers) ? 'Complete' : 'Incomplete'}
                        interpretation={isUnlocked ? planes[key as keyof typeof planes].content : planes[key as keyof typeof planes].teaser}
                    />
                ))}
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
              title={tooltipTitle}
              number={activeNumber.num}
              onClose={handleCloseTooltip}
            />
        </>
      )}
    </>
  );
};

export default LoshuGrid;