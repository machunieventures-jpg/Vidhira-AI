import React from 'react';
import type { CompatibilityPairing } from '../../types';

interface CompatibilityListProps {
    title: React.ReactNode;
    pairings: CompatibilityPairing[];
}

const CompatibilityList: React.FC<CompatibilityListProps> = ({ title, pairings }) => {
    return (
        <div>
            <h5 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-display mb-3">{title}</h5>
            <div className="space-y-3">
                {pairings.map(p => (
                    <div 
                        key={p.compatibleNumber} 
                        className="group flex items-start gap-4 p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg transition-all duration-300 hover:bg-purple-100/80 dark:hover:bg-purple-800/50 hover:scale-[1.02]"
                    >
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border rounded-full font-bold text-xl transition-all duration-300 bg-purple-100/80 border-[--cosmic-purple]/50 text-[--cosmic-purple] dark:bg-purple-800/50 dark:border-[--gold-accent]/50 dark:text-[--gold-accent] group-hover:bg-[--cosmic-purple] dark:group-hover:bg-[--gold-accent] group-hover:text-white dark:group-hover:text-black group-hover:border-[--cosmic-purple] dark:group-hover:border-[--gold-accent] group-hover:scale-110">
                            {p.compatibleNumber}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-gray-100">
                            {p.interpretation}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompatibilityList;