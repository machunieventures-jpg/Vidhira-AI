import React from 'react';
import type { CompatibilityPairing } from '../../types';

interface CompatibilityListProps {
    title: React.ReactNode;
    pairings: CompatibilityPairing[];
}

const CompatibilityList: React.FC<CompatibilityListProps> = ({ title, pairings }) => {
    return (
        <div>
            <h5 className="text-lg font-bold text-starlight font-display mb-3">{title}</h5>
            <div className="space-y-3">
                {pairings.map(p => (
                    <div 
                        key={p.compatibleNumber} 
                        className="group flex items-start gap-4 p-3 bg-deep-void/20 rounded-lg transition-all duration-300 hover:bg-cosmic-gold/10 hover:scale-[1.02]"
                    >
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border rounded-full font-bold text-xl transition-all duration-300 bg-cosmic-gold/10 border-cosmic-gold/50 text-cosmic-gold group-hover:bg-cosmic-gold group-hover:text-deep-void group-hover:border-cosmic-gold group-hover:scale-110">
                            {p.compatibleNumber}
                        </div>
                        <p className="text-sm text-lunar-grey transition-colors duration-300 group-hover:text-starlight">
                            {p.interpretation}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompatibilityList;
