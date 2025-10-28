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
            const result = await getYearlyForecast(mulank, userData.fullName);
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
            const result = await getDailyHoroscope(mulank, userData.fullName);
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
                 <h4 className="text-xl font-bold text-cool-cyan font-display mb-3">Daily Cosmic Navigator</h4>
                <p className="text-sm text-white/70 mb-4">
                    Get a quick, personalized insight for today based on your Mulank <strong className="text-aurora-pink text-lg">{mulank}</strong> and the current planetary vibrations.
                </p>
                 <button
                    onClick={handleGenerateDailyHoroscope}
                    className="w-full sm:w-auto bg-cool-cyan text-celestial-sapphire font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cool-cyan/30 disabled:bg-gray-500 disabled:scale-100 disabled:cursor-not-allowed"
                    disabled={isDailyLoading}
                >
                    {isDailyLoading ? "Tuning in..." : (dailyHoroscope ? "Refresh Today's Insight" : "Get Today's Insight")}
                </button>

                {dailyError && <p className="text-aurora-pink text-sm mt-3">{dailyError}</p>}

                {isDailyLoading && (
                     <div className="mt-4 flex items-center justify-center space-x-2 text-cool-cyan">
                        <div className="w-6 h-6 border-2 border-cool-cyan border-t-celestial-sapphire rounded-full animate-spin"></div>
                        <span>Receiving Cosmic Transmission...</span>
                    </div>
                )}

                {dailyHoroscope && !isDailyLoading && (
                    <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg animate-slide-up">
                        <MarkdownRenderer content={dailyHoroscope} />
                    </div>
                )}
            </div>
            
            <hr className="border-white/10 my-8" />

            <div className="mb-8">
                <RahuKaalCalculator />
            </div>

            <hr className="border-white/10 my-8" />
            
            <div>
                <h4 className="text-xl font-bold text-cool-cyan font-display mb-3">Mulank-Based Yearly Forecast</h4>
                <p className="text-sm text-white/70 mb-4">
                    Your primary birth number, or 'Mulank', is <strong className="text-aurora-pink text-lg">{mulank}</strong>. This number reveals deep insights into your personality and destiny. Generate a personalized forecast for 2026 and beyond based on this core energy.
                </p>
                
                <button
                    onClick={handleGenerateForecast}
                    className="w-full sm:w-auto bg-aurora-pink text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-aurora-pink/30 disabled:bg-gray-500 disabled:scale-100 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? 'Generating...' : (forecast ? 'Regenerate Forecast' : 'Generate Forecast')}
                </button>

                {error && <p className="text-aurora-pink text-sm mt-3">{error}</p>}

                {isLoading && (
                     <div className="mt-4 flex items-center justify-center space-x-2 text-cool-cyan">
                        <div className="w-6 h-6 border-2 border-cool-cyan border-t-celestial-sapphire rounded-full animate-spin"></div>
                        <span>Peering into the Future...</span>
                    </div>
                )}

                {forecast && !isLoading && (
                    <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg animate-slide-up">
                        <MarkdownRenderer content={forecast} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default YearlyForecast;
