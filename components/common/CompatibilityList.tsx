import React from 'react';
import type { CompatibilityPairing } from '../../types';

interface CompatibilityListProps {
    title: React.ReactNode;
    pairings: CompatibilityPairing[];
}

const CompatibilityList: React.FC<CompatibilityListProps> = ({ title, pairings }) => {
    return (
        <div>
            <h5 className="text-lg font-bold text-gray-900 dark:text-star-white font-display mb-3">{title}</h5>
            <div className="space-y-3">
                {pairings.map(p => (
                    <div 
                        key={p.compatibleNumber} 
                        className="group flex items-start gap-4 p-3 bg-gray-100/50 dark:bg-cosmic-dark/20 rounded-lg transition-all duration-300 hover:bg-suryansh-gold/10 hover:scale-[1.02]"
                    >
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border rounded-full font-bold text-xl transition-all duration-300 bg-suryansh-gold/10 border-suryansh-gold/50 text-suryansh-gold group-hover:bg-suryansh-gold group-hover:text-cosmic-dark group-hover:border-suryansh-gold group-hover:scale-110">
                            {p.compatibleNumber}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-chandra-grey transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-star-white">
                            {p.interpretation}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompatibilityList;