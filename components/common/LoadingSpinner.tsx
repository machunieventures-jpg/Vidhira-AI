import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-stone-brown dark:text-manuscript-parchment">
        <svg 
            width="80" 
            height="80" 
            viewBox="0 0 100 100" 
            xmlns="http://www.w3.org/2000/svg" 
            className="text-suryansh-gold"
        >
            <style>
                {`
                    @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @keyframes rotate-rev { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
                    .mandala-part {
                        transform-origin: 50px 50px;
                        animation-duration: 10s;
                        animation-timing-function: linear;
                        animation-iteration-count: infinite;
                    }
                `}
            </style>
            <g className="mandala-part" style={{ animationName: 'rotate' }}>
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.3" />
                <path d="M50,2 L58,25 L81,25 L64,42 L72,65 L50,50 L28,65 L36,42 L19,25 L42,25 Z" fill="currentColor" fillOpacity="0.1" />
            </g>
            <g className="mandala-part" style={{ animationName: 'rotate-rev' }}>
                <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
                <circle cx="50" cy="50" r="12" fill="currentColor" fillOpacity="0.2" />
            </g>
             <circle cx="50" cy="50" r="2" fill="currentColor" />
        </svg>
        <p className="font-display text-xl text-suryansh-gold">Charting Your Cosmic Blueprint...</p>
        <p className="text-stone-brown/80 dark:text-manuscript-parchment/80 text-sm max-w-sm text-center">
            Vidhira is analyzing your unique vibrational signature. Please wait a moment.
        </p>
    </div>
  );
};

export default LoadingSpinner;