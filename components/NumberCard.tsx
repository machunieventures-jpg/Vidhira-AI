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
      className={`p-4 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${className || ''}`}
      style={style}
    >
      <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[--cosmic-purple] to-[--gold-accent] text-white shadow-lg">
          <span
            className={`text-4xl font-bold ${shouldAnimate ? 'animate-slide-up' : ''}`}
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
            {!isExpanded && canExpand && <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white via-white to-transparent dark:from-[--cosmic-blue] dark:via-[--cosmic-blue] pointer-events-none"></div>}
          </div>
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