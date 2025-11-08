import React from 'react';

const LoadingMandala: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <div className="loading-mandala"></div>
        <h2 className="text-2xl font-bold gradient-text" style={{fontFamily: 'Cinzel, serif'}}>Charting Your Cosmos</h2>
        <p className="text-[--cosmic-blue] dark:text-[--stardust] max-w-sm">Vidhira is decoding your unique vibrational signature. This alignment of cosmic energies may take a moment.</p>
    </div>
);

export default LoadingMandala;