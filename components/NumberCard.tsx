import React, { useState } from 'react';
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
  
  // A simple heuristic to determine if the content is long enough to be collapsible
  const canExpand = data.interpretation.length > 250;

  return (
    <div 
      className={`p-6 rounded-2xl transition-colors duration-300 border border-lunar-grey/20 hover:border-cosmic-gold/50 bg-void-tint/30 hover:bg-void-tint/60 ${className || ''}`}
      style={style}
    >
      <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-void-tint to-deep-void border-2 border-cosmic-gold/50 shadow-lg">
          <span className="text-4xl font-bold text-starlight font-display animate-number-pop">{data.number}</span>
          {data.compound && data.compound !== data.number && (
            <span className="text-xs text-cosmic-gold/70 -mt-1">from {data.compound}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xl font-bold text-cosmic-gold font-display">{title}</h4>
          <div className="mt-1 relative">
            <div className={`expandable-content ${isExpanded ? 'max-h-1000px' : 'max-h-120px'}`}>
              <MarkdownRenderer content={data.interpretation} />
            </div>
            {!isExpanded && canExpand && <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-void-tint/60 via-void-tint/80 to-transparent pointer-events-none"></div>}
          </div>
           {canExpand && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-cosmic-gold font-semibold mt-2 hover:underline text-sm">
              {isExpanded ? 'Show Less' : 'Read More...'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumberCard;
