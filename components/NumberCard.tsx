
import React, { useState, useEffect, useRef } from 'react';
import type { CoreNumberInfo } from '../types';
import MarkdownRenderer from './common/MarkdownRenderer';

interface NumberCardProps {
  title: string;
  data: CoreNumberInfo;
  className?: string;
  style?: React.CSSProperties;
}

const NumberCard: React.FC<NumberCardProps> = ({ title, data, className, style }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      setShouldAnimate(true);
    }
  }, [data.number]);
  
  const canExpand = data.interpretation.length > 250;

  return (
    <div 
      className={`relative p-4 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${className || ''}`}
      style={style}
    >
      {data.karmicDebt && (
        <div className="absolute top-2 right-2 bg-[--rose-accent] text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
          Karmic Debt {data.karmicDebt}
        </div>
      )}
      <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[--cosmic-purple] to-[--rose-accent] text-white shadow-lg">
          <span
            className={`text-4xl font-bold ${shouldAnimate ? 'animate-pop-in' : ''}`}
            style={{fontFamily: 'Cinzel, serif'}}
            onAnimationEnd={() => setShouldAnimate(false)}
          >
            {data.number}
          </span>
          {data.compound && data.compound !== data.number && (
            <span className="text-xs text-white/80 -mt-1">from {data.compound}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100" style={{fontFamily: 'Playfair Display, serif'}}>{title}</h4>
          {data.planetaryRuler && (
            <p className="text-sm font-semibold text-[--cosmic-purple] dark:text-[--gold-accent] -mt-1 mb-2">
              Ruler: {data.planetaryRuler}
            </p>
          )}
          <div className="mt-1 relative">
            <div className={`prose-sm max-w-none transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px]' : 'max-h-[7rem]'}`}>
              <MarkdownRenderer content={data.interpretation} />
            </div>
            {!isExpanded && canExpand && <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-purple-50/50 via-purple-50/80 to-purple-50 dark:from-transparent dark:to-purple-900/50 pointer-events-none"></div>}
          </div>

          {data.journalPrompt && (
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-[--cosmic-purple]">
                <h5 className="text-sm font-bold text-[--cosmic-purple] dark:text-[--gold-accent] mb-2 flex items-center gap-2">
                    <span className="text-lg">✍️</span> AI Reflection Prompt
                </h5>
                <p className="italic text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    "{data.journalPrompt}"
                </p>
            </div>
          )}

           {canExpand && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-[--cosmic-purple] font-semibold mt-2 hover:underline text-sm">
              {isExpanded ? 'Show Less' : 'Read More...'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumberCard;
