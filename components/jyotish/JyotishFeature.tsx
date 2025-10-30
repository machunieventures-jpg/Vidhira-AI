
import React, { useState } from 'react';
import { generateJyotishReport } from '../../services/geminiService';
import type { UserData } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { trackEvent } from '../../services/analyticsService';

interface JyotishFeatureProps {
    userData: UserData;
}

const JyotishFeature: React.FC<JyotishFeatureProps> = ({ userData }) => {
    const [report, setReport] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            const result = await generateJyotishReport(userData);
            setReport(result);
            trackEvent('JYOTISH_REPORT_GENERATED', { userName: userData.fullName });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate your Jyotish report. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-4 text-starlight py-8">
                    <div className="w-12 h-12 border-4 border-lunar-grey border-t-cosmic-gold rounded-full animate-spin"></div>
                    <p className="font-display text-lg text-cosmic-gold">Casting your Vedic Chart...</p>
                    <p className="text-lunar-grey text-sm max-w-sm text-center">
                        This is a complex calculation aligning planetary positions from your moment of birth. Please be patient.
                    </p>
                </div>
            )}

            {error && (
                 <div className="text-center text-cosmic-gold/90 bg-deep-void/20 p-4 rounded-lg">
                    <p className="font-bold">Error</p>
                    <p className="text-starlight/80 mt-1 text-sm">{error}</p>
                    <button onClick={handleGenerate} className="mt-3 bg-cosmic-gold text-deep-void font-bold py-1 px-3 text-sm rounded-lg">
                        Try Again
                    </button>
                </div>
            )}
            
            {!isLoading && !report && !error && (
                 <div className="text-center p-4">
                    <p className="text-lunar-grey mb-4">
                        Go beyond numerology with a traditional Vedic Astrology (Jyotish) report. This deep dive analyzes your planetary placements for insights into your karma, destiny, and life's major periods.
                    </p>
                    <button
                        onClick={handleGenerate}
                        className="bg-cosmic-gold text-deep-void font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cosmic-gold/20 hover:shadow-[0_0_20px_var(--lucky-color-glow)]"
                    >
                        Generate Traditional Jyotish Report
                    </button>
                </div>
            )}

            {report && (
                <div className="mt-4 animate-fade-in">
                     <MarkdownRenderer content={report} />
                </div>
            )}
        </div>
    );
};

export default JyotishFeature;
