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
    mental: { name: 'Mental Plane', numbers: [4, 9, 2], description: 'Represents thinking, creativity, and analytical abilities.' },
    emotional: { name: 'Emotional Plane', numbers: [3, 5, 7], description: 'Governs intuition, spiritual depth, and emotional expression.' },
    practical: { name: 'Practical Plane', numbers: [8, 1, 6], description: 'Relates to grounding, physical work, and material success.' },
    thought: { name: 'Thought Plane', numbers: [4, 3, 8], description: 'Indicates the ability to conceive ideas and visualize.' },
    will: { name: 'Will Plane', numbers: [9, 5, 1], description: 'Shows determination, patience, and follow-through.' },
    action: { name: 'Action Plane', numbers: [2, 7, 6], description: 'Represents the capacity to put plans into dynamic action.' },
    determination: { name: 'Determination Plane', numbers: [4, 5, 6], description: 'A powerful diagonal of resolve and success against odds.' },
    spiritual: { name: 'Spiritual Plane', numbers: [2, 5, 8], description: 'Highlights a strong connection to intuition and inner guidance.' },
};

// --- SUB-COMPONENTS ---
const PlaneInterpretationCard: React.FC<{title: string, status: string, interpretation: string}> = ({title, status, interpretation}) => (
    <div className="bg-void-tint/30 p-4 rounded-lg border border-lunar-grey/10">
        <div className="flex justify-between items-start mb-2">
            <span className="font-semibold text-starlight">{title}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'Complete' ? 'bg-cosmic-gold/20 text-cosmic-gold' : 'bg-lunar-grey/20 text-lunar-grey'}`}>
                {status}
            </span>
        </div>
        <p className="text-lunar-grey text-sm">{interpretation}</p>
    </div>
);

const SpecialNumberTooltip: React.FC<{
    content: string;
    position: { top: number; left: number };
}> = ({ content, position }) => {
    const style = {
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, -100%)',
    };
    return (
        <div
            className="fixed z-50 p-2 bg-void-tint/90 backdrop-blur-xl rounded-md shadow-lg border border-lunar-grey/50 text-starlight text-sm animate-fade-in-fast"
            style={style}
        >
            {content}
        </div>
    );
};

// --- MAIN COMPONENT ---
const LoshuGrid: React.FC<LoshuGridProps> = ({ grid, missingNumbers, overloadedNumbers, userData, birthNumber, destinyNumber, elementalPlanes, isUnlocked }) => {
  // State for original number interpretation tooltip
  const [activeNumber, setActiveNumber] = useState<{num: number, isMissing: boolean} | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [potentialInterpretation, setPotentialInterpretation] = useState<string | null>(null);
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState<boolean>(false);
  const [tooltipPosition, setTooltipPosition] = useState<{top: number, left: number} | null>(null);

  // State for new Birth/Destiny number tooltip
  const [specialTooltip, setSpecialTooltip] = useState<{
    content: string;
    position: { top: number; left: number };
  } | null>(null);

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
        const result = await getLoshuNumberInterpretation(
            num,
            isMissing,
            userData.fullName,
            userData.dob,
            userData.language
        );
        setInterpretation(result);

        // For missing numbers, also fetch the positive interpretation to show their potential
        if (isMissing) {
             const potentialResult = await getLoshuNumberInterpretation(
                num,
                false, // isMissing = false
                userData.fullName,
                userData.dob,
                userData.language
            );
            setPotentialInterpretation(potentialResult);
        }
    } catch (error) {
        console.error('Error fetching number interpretation:', error);
        setInterpretation('Could not retrieve interpretation at this time.');
    } finally {
        setIsLoadingInterpretation(false);
    }
  };

  const handleSpecialNumberEnter = useCallback(async (
    num: number,
    type: 'Birth' | 'Destiny' | 'Birth & Destiny',
    event: React.MouseEvent
  ) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setSpecialTooltip({
      content: 'Consulting...',
      position: { top: rect.top + window.scrollY, left: rect.left + rect.width / 2 + window.scrollX }
    });
    const result = await getCoreIdentifierInterpretation(num, type, userData.fullName, userData.language);
    setSpecialTooltip(prev => prev ? { ...prev, content: result } : null);
  }, [userData]);

  const handleSpecialNumberLeave = useCallback(() => {
    setSpecialTooltip(null);
  }, []);

  useEffect(() => {
    if (!activeNumber) return;
    const handleScroll = () => { handleCloseTooltip(); };
    window.addEventListener('scroll', handleScroll, true);
    return () => { window.removeEventListener('scroll', handleScroll, true); };
  }, [activeNumber, handleCloseTooltip]);

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
        <div className="relative w-[256px] h-[256px] self-center md:self-start">
            <div className="absolute inset-0 grid grid-cols-3 gap-2 p-2 bg-void-tint rounded-lg border border-lunar-grey/50">
            {grid.flat().map((cellContent, index) => {
                const row = Math.floor(index / 3);
                const col = index % 3;
                const numberForCell = positionToNumberMap[`${row}-${col}`];

                const isCellActive = cellContent && activeNumber?.num === numberForCell && !activeNumber?.isMissing;
                
                const containsBirth = cellContent && cellContent.includes(birthNumber.toString());
                const containsDestiny = cellContent && cellContent.includes(destinyNumber.toString());
                const isBoth = containsBirth && containsDestiny;

                const highlightClass = isBoth ? 'highlight-both' : containsBirth ? 'highlight-birth' : containsDestiny ? 'highlight-destiny' : '';
                const type: 'Birth' | 'Destiny' | 'Birth & Destiny' = isBoth ? 'Birth & Destiny' : containsBirth ? 'Birth' : 'Destiny';

                return (
                    <div
                        key={index}
                        className={`w-full h-full flex items-center justify-center font-bold rounded-md bg-deep-void/50 border-2 border-transparent ${cellContent ? 'cursor-pointer hover:bg-lunar-grey/20' : ''} ${isCellActive ? 'animate-scale-pulse' : ''} ${highlightClass}`}
                        onClick={(e) => cellContent && handleNumberClick(numberForCell, false, e)}
                        onMouseEnter={(e) => (containsBirth || containsDestiny) && handleSpecialNumberEnter(numberForCell, type, e)}
                        onMouseLeave={(e) => (containsBirth || containsDestiny) && handleSpecialNumberLeave()}
                    >
                        {cellContent ? <span className={`${cellContent.length > 2 ? 'text-xl' : 'text-3xl'} ${isBoth ? "bg-clip-text text-transparent bg-gradient-to-r from-cosmic-gold to-cyan-400" : "text-starlight"}`}>{cellContent}</span> : <span className="text-starlight/20">-</span>}
                    </div>
                )
            })}
            </div>
        </div>
        
        {/* Right: Core Matrix Analysis */}
        <div className="flex-1 space-y-6">
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
                                className={`w-10 h-10 flex items-center justify-center bg-cosmic-gold/10 border border-cosmic-gold/50 rounded-full text-cosmic-gold font-bold cursor-pointer hover:bg-cosmic-gold/20 transform transition-all duration-300 hover:scale-110 hover:shadow-[0_0_12px_var(--lucky-color-glow)] ${isMissingActive ? 'animate-scale-pulse' : ''}`}
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

       <div className="mt-8 pt-6 border-t border-lunar-grey/10">
            <h4 className="text-xl font-bold text-cosmic-gold font-display mb-4">Elemental Planes Analysis</h4>
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
         <div className="mt-8 pt-6 border-t border-lunar-grey/10">
            <h4 className="text-xl font-bold text-cosmic-gold font-display mb-4">Arrows of Strength & Weakness</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {Object.values(planes).map(plane => (
                    <div key={plane.name} className="bg-void-tint/30 p-3 rounded-lg border border-lunar-grey/10">
                        <div className="flex justify-between items-start">
                            <span className="font-semibold text-starlight">{plane.name}</span>
                            {isPlaneComplete(plane.numbers) ? (
                                <span className="text-cosmic-gold">✓</span>
                            ) : (
                                <span className="text-lunar-grey/50">✗</span>
                            )}
                        </div>
                        <p className="text-lunar-grey text-xs mt-1">{plane.description}</p>
                    </div>
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
              number={activeNumber.num}
              onClose={handleCloseTooltip}
            />
        </>
      )}
      {specialTooltip && (
          <SpecialNumberTooltip
            content={specialTooltip.content}
            position={specialTooltip.position}
           />
      )}
    </>
  );
};

export default LoshuGrid;