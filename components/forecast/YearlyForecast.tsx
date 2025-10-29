
import React, { useState, useMemo } from 'react';
import { calculateMulank } from '../../services/numerologyService';
import { getYearlyForecast, getDailyHoroscope } from '../../services/geminiService';
import type { UserData } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';
import RahuKaalCalculator from './RahuKaalCalculator';

interface YearlyForecastProps {
    userData: UserData;
}

const YearlyForecast: React.FC<YearlyForecastProps> = ({ userData }) => {
    const [forecast, setForecast] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [dailyHoroscope, setDailyHoroscope] = useState<string | null>(null);
    const [isDailyLoading, setIsDailyLoading] = useState(false);
    const [dailyError, setDailyError] = useState<string | null>(null);

    const mulank = useMemo(() => calculateMulank(userData.dob), [userData.dob]);

    const handleGenerateForecast = async () => {
        setIsLoading(true);
        setError(null);
        setForecast(null); // Clear previous forecast on regeneration

        try {
            const result = await getYearlyForecast(mulank, userData.fullName, userData.language);
            setForecast(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate forecast. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateDailyHoroscope = async () => {
        setIsDailyLoading(true);
        setDailyError(null);
        setDailyHoroscope(null);

        try {
            const result = await getDailyHoroscope(mulank, userData.fullName, userData.language);
            setDailyHoroscope(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setDailyError(`Failed to generate today's horoscope. ${errorMessage}`);
        } finally {
            setIsDailyLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                 <h4 className="text-xl font-bold text-cosmic-gold font-display mb-3">Daily Cosmic Navigator</h4>
                <p className="text-sm text-lunar-grey mb-4">
                    Get a quick, personalized insight for today based on your Mulank <strong className="text-cosmic-gold text-lg">{mulank}</strong> and the current planetary vibrations.
                </p>
                 <button
                    onClick={handleGenerateDailyHoroscope}
                    className="w-full sm:w-auto border border-cosmic-gold text-cosmic-gold font-bold py-2 px-6 rounded-lg hover:bg-cosmic-gold hover:text-deep-void transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed hover:shadow-[0_0_15px_var(--lucky-color-glow)]"
                    disabled={isDailyLoading}
                >
                    {isDailyLoading ? "Tuning in..." : (dailyHoroscope ? "Refresh Today's Insight" : "Get Today's Insight")}
                </button>

                {dailyError && <p className="text-cosmic-gold/90 text-sm mt-3">{dailyError}</p>}

                {isDailyLoading && (
                     <div className="mt-4 flex items-center justify-center space-x-2 text-lunar-grey">
                        <div className="w-6 h-6 border-2 border-lunar-grey border-t-cosmic-gold rounded-full animate-spin"></div>
                        <span>Receiving Cosmic Transmission...</span>
                    </div>
                )}

                {dailyHoroscope && !isDailyLoading && (
                    <div className="mt-6 p-4 bg-deep-void/30 border border-lunar-grey/10 rounded-lg animate-slide-up">
                        <MarkdownRenderer content={dailyHoroscope} />
                    </div>
                )}
            </div>
            
            <hr className="border-lunar-grey/10 my-8" />

            <div className="mb-8">
                <RahuKaalCalculator />
            </div>

            <hr className="border-lunar-grey/10 my-8" />
            
            <div>
                <h4 className="text-xl font-bold text-cosmic-gold font-display mb-3">Mulank-Based Yearly Forecast</h4>
                <p className="text-sm text-lunar-grey mb-4">
                    Your primary birth number, or 'Mulank', is <strong className="text-cosmic-gold text-lg">{mulank}</strong>. This number reveals deep insights into your personality and destiny. Generate a personalized forecast for 2026 and beyond based on this core energy.
                </p>
                
                <button
                    onClick={handleGenerateForecast}
                    className="w-full sm:w-auto bg-cosmic-gold text-deep-void font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cosmic-gold/20 disabled:bg-lunar-grey disabled:scale-100 disabled:cursor-not-allowed hover:shadow-[0_0_15px_var(--lucky-color-glow)]"
                    disabled={isLoading}
                >
                    {isLoading ? 'Generating...' : (forecast ? 'Regenerate Forecast' : 'Generate Forecast')}
                </button>

                {error && <p className="text-cosmic-gold/90 text-sm mt-3">{error}</p>}

                {isLoading && (
                     <div className="mt-4 flex items-center justify-center space-x-2 text-lunar-grey">
                        <div className="w-6 h-6 border-2 border-lunar-grey border-t-cosmic-gold rounded-full animate-spin"></div>
                        <span>Peering into the Future...</span>
                    </div>
                )}

                {forecast && !isLoading && (
                    <div className="mt-6 p-4 bg-deep-void/30 border border-lunar-grey/10 rounded-lg animate-slide-up">
                        <MarkdownRenderer content={forecast} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default YearlyForecast;
