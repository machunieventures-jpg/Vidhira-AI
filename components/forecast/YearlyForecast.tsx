import React, { useState, useMemo } from 'react';
import { calculateMulank } from '../../services/numerologyService';
import { getYearlyForecast } from '../../services/geminiService';
import type { UserData } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';

interface YearlyForecastProps {
    userData: UserData;
}

const YearlyForecast: React.FC<YearlyForecastProps> = ({ userData }) => {
    const [forecast, setForecast] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mulank = useMemo(() => calculateMulank(userData.dob), [userData.dob]);

    const handleGenerateForecast = async () => {
        setIsLoading(true);
        setError(null);
        setForecast(null);

        try {
            const result = await getYearlyForecast(mulank, userData.fullName);
            setForecast(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate forecast. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h4 className="text-xl font-bold text-cool-cyan font-display mb-3">Mulank-Based Yearly Forecast</h4>
            <p className="text-sm text-white/70 mb-4">
                Your primary birth number, or 'Mulank', is <strong className="text-aurora-pink text-lg">{mulank}</strong>. This number reveals deep insights into your personality and destiny. Generate a personalized forecast for 2026 and beyond based on this core energy.
            </p>
            
            {!forecast && !isLoading && (
                 <button
                    onClick={handleGenerateForecast}
                    className="w-full sm:w-auto bg-aurora-pink text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-aurora-pink/30"
                >
                    Generate 2026+ Forecast
                </button>
            )}

            {error && <p className="text-aurora-pink text-sm mt-3">{error}</p>}

            {isLoading && (
                 <div className="mt-4 flex items-center justify-center space-x-2 text-cool-cyan">
                    <div className="w-6 h-6 border-2 border-cool-cyan border-t-transparent rounded-full animate-spin"></div>
                    <span>Peering into the Future...</span>
                </div>
            )}

            {forecast && (
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg animate-slide-up">
                    <MarkdownRenderer content={forecast} />
                </div>
            )}
        </div>
    );
};

export default YearlyForecast;
