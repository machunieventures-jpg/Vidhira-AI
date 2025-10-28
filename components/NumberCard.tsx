import React from 'react';
import type { CoreNumberInfo } from '../types';

interface NumberCardProps {
  title: string;
  data: CoreNumberInfo;
  className?: string;
}

const NumberCard: React.FC<NumberCardProps> = ({ title, data, className }) => {
  return (
    <div className={`p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cool-cyan/10 hover:brightness-110 ${className || ''}`}>
      <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-aurora-pink to-celestial-sapphire border-2 border-galactic-silver shadow-lg">
          <span className="text-4xl font-bold text-galactic-silver font-display">{data.number}</span>
          {data.compound && data.compound !== data.number && (
            <span className="text-xs text-cool-cyan/80 -mt-1">from {data.compound}</span>
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-xl font-bold text-cool-cyan font-display">{title}</h4>
          <p className="text-white/80 mt-1 text-justify whitespace-pre-wrap">
            {data.interpretation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NumberCard;
