import React, { useState } from 'react';
import { generateJyotishReport } from '../../services/geminiService';
import type { UserData, JyotishReportData } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { trackEvent } from '../../services/analyticsService';
import PlanetaryChart from './PlanetaryChart';
import RasiChart from './RasiChart';

interface JyotishFeatureProps {
    userData: UserData;
}

const JyotishFeature: React.FC<JyotishFeatureProps> = ({ userData }) => {
    const [report, setReport] = useState<JyotishReportData | null>(null);
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
                <div className="flex flex-col items-center justify-center space-y-4 text-stone-brown dark:text-manuscript-parchment py-8">
                    <div className="w-12 h-12 border-4 border-stone-brown/20 dark:border-manuscript-parchment/20 border-t-suryansh-gold rounded-full animate-spin"></div>
                    <p className="font-display text-lg text-suryansh-gold">Casting your Vedic Chart...</p>
                    <p className="text-stone-brown/80 dark:text-manuscript-parchment/80 text-sm max-w-sm text-center">
                        This is a complex calculation aligning planetary positions from your moment of birth. Please be patient.
                    </p>
                </div>
            )}

            {error && (
                 <div className="text-center text-terracotta-red bg-terracotta-red/10 p-4 rounded-lg">
                    <p className="font-bold">Error</p>
                    <p className="text-stone-brown/80 dark:text-manuscript-parchment/80 mt-1 text-sm">{error}</p>
                    <button onClick={handleGenerate} className="mt-3 btn-neumorphic">
                        Try Again
                    </button>
                </div>
            )}
            
            {!isLoading && !report && !error && (
                 <div className="text-center p-4">
                    <p className="text-stone-brown/80 dark:text-manuscript-parchment/80 mb-4">
                        Go beyond numerology with a traditional Vedic Astrology (Jyotish) report. This deep dive analyzes your planetary placements for insights into your karma, destiny, and life's major periods.
                    </p>
                    <button
                        onClick={handleGenerate}
                        className="btn-neumorphic primary"
                    >
                        Generate Traditional Jyotish Report
                    </button>
                </div>
            )}

            {report && (
                <div className="mt-4 animate-fade-in space-y-8">
                     <RasiChart placements={report.planetaryPlacements} ascendant={report.ascendantSign} />
                     <hr className="border-stone-brown/10 dark:border-manuscript-parchment/10" />
                     <PlanetaryChart data={report.planetaryPlacements} />
                     <hr className="border-stone-brown/10 dark:border-manuscript-parchment/10" />
                     <MarkdownRenderer content={report.markdownReport} />
                </div>
            )}
        </div>
    );
};

export default JyotishFeature;