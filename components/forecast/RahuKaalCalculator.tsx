import React, { useState } from 'react';

const RahuKaalCalculator: React.FC = () => {
    const [sunrise, setSunrise] = useState('06:00');
    const [sunset, setSunset] = useState('18:00');
    const [rahuKaal, setRahuKaal] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const calculateRahuKaal = () => {
        setError(null);
        setRahuKaal(null);

        if (!sunrise || !sunset) {
            setError("Please select both sunrise and sunset times.");
            return;
        }

        const sunriseDate = new Date(`1970-01-01T${sunrise}:00`);
        const sunsetDate = new Date(`1970-01-01T${sunset}:00`);

        if (sunriseDate >= sunsetDate) {
            setError("Sunrise time must be before sunset time.");
            return;
        }

        const daytimeDuration = (sunsetDate.getTime() - sunriseDate.getTime()) / 1000 / 60; // in minutes
        const segmentDuration = daytimeDuration / 8;

        const dayOfWeek = new Date().getDay(); // Sunday - 0, Monday - 1, ...

        const segmentMultipliers = [7, 1, 6, 4, 5, 3, 2];
        const multiplier = segmentMultipliers[dayOfWeek];
        
        const rahuKaalStartMinutes = multiplier * segmentDuration;
        const rahuKaalEndMinutes = (multiplier + 1) * segmentDuration;

        const rahuKaalStartDate = new Date(sunriseDate.getTime() + rahuKaalStartMinutes * 60000);
        const rahuKaalEndDate = new Date(sunriseDate.getTime() + rahuKaalEndMinutes * 60000);

        const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        setRahuKaal(`${formatTime(rahuKaalStartDate)} - ${formatTime(rahuKaalEndDate)}`);
    };

    return (
        <div>
            <h4 className="text-xl font-bold gradient-text mb-3">Rahu Kaal Calculator</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Calculate the inauspicious time of the day (Rahu Kaal) to avoid starting new ventures. Enter today's sunrise and sunset times for your location.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="w-full">
                    <label htmlFor="sunrise" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Sunrise Time</label>
                    <input
                        type="time"
                        id="sunrise"
                        value={sunrise}
                        onChange={(e) => setSunrise(e.target.value)}
                        className="input-cosmic"
                    />
                </div>
                <div className="w-full">
                    <label htmlFor="sunset" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Sunset Time</label>
                    <input
                        type="time"
                        id="sunset"
                        value={sunset}
                        onChange={(e) => setSunset(e.target.value)}
                        className="input-cosmic"
                    />
                </div>
            </div>
             <button
                onClick={calculateRahuKaal}
                className="w-full sm:w-auto btn-cosmic !py-2 !px-4"
            >
                Calculate for Today
            </button>
            
            {error && <p className="text-[--rose-accent] text-sm mt-3">{error}</p>}

            {rahuKaal && (
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg animate-slide-up text-center">
                    <p className="text-gray-600 dark:text-gray-300">Today's Rahu Kaal is from:</p>
                    <p className="text-2xl font-bold gradient-text mt-1">{rahuKaal}</p>
                </div>
            )}
        </div>
    );
};

export default RahuKaalCalculator;
