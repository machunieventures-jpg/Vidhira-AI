import React from 'react';
import type { CoreNumberInfo } from '../types';

interface NumberCardProps {
  title: string;
  data: CoreNumberInfo;
}

const NumberCard: React.FC<NumberCardProps> = ({ title, data }) => {
  return (
    <div className="p-6 rounded-2xl transition-colors duration-300 border border-lunar-grey/20 hover:border-cosmic-gold/50 bg-void-tint/30 hover:bg-void-tint/60">
      <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-void-tint to-deep-void border-2 border-cosmic-gold/50 shadow-lg">
          <span className="text-4xl font-bold text-starlight font-display">{data.number}</span>
          {data.compound && data.compound !== data.number && (
            <span className="text-xs text-cosmic-gold/70 -mt-1">from {data.compound}</span>
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold text-cosmic-gold font-display">{title}</h4>
          <p className="text-lunar-grey mt-1 text-justify whitespace-pre-wrap">
            {data.interpretation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NumberCard;