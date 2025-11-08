import React, { useState } from 'react';
import { generateJyotishReport } from '../../services/geminiService';
import type { UserData, JyotishReportData } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { trackEvent } from '../../services/analyticsService';
import PlanetaryChart from './PlanetaryChart';
import RasiChart from './RasiChart';
import GrahaBalaChart from './GrahaBalaChart';

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
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <div className="loading-mandala"></div>
                    <p className="text-xl font-bold gradient-text">Casting your Vedic Chart...</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm max-w-sm text-center">
                        This is a complex calculation aligning planetary positions from your moment of birth. Please be patient.
                    </p>
                </div>
            )}

            {error && (
                 <div className="text-center bg-[--rose-accent]/10 text-[--rose-accent] p-4 rounded-lg">
                    <p className="font-bold">Error</p>
                    <p className="mt-1 text-sm">{error}</p>
                    <button onClick={handleGenerate} className="mt-3 btn-cosmic !py-2 !px-4">
                        Try Again
                    </button>
                </div>
            )}
            
            {!isLoading && !report && !error && (
                 <div className="text-center p-4">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Go beyond numerology with a traditional Vedic Astrology (Jyotish) report. This deep dive analyzes your planetary placements for insights into your karma, destiny, and life's major periods.
                    </p>
                    <button
                        onClick={handleGenerate}
                        className="btn-cosmic"
                    >
                        Generate Traditional Jyotish Report
                    </button>
                </div>
            )}

            {report && (
                <div className="mt-4 animate-slide-up space-y-8">
                     <RasiChart placements={report.planetaryPlacements} ascendant={report.ascendantSign} />
                     <hr className="border-gray-200 dark:border-gray-700" />
                     <GrahaBalaChart data={report.grahaBala} />
                     <hr className="border-gray-200 dark:border-gray-700" />
                     <PlanetaryChart data={report.planetaryPlacements} />
                     <hr className="border-gray-200 dark:border-gray-700" />
                     <MarkdownRenderer content={report.markdownReport} />
                </div>
            )}
        </div>
    );
};

export default JyotishFeature;