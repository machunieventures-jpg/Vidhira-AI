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

        // Rahu Kaal segment order for each day (starting from Sunday=0)
        // Sun: 8th, Mon: 2nd, Tue: 7th, Wed: 5th, Thu: 6th, Fri: 4th, Sat: 3rd
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
            <h4 className="text-xl font-bold text-cool-cyan font-display mb-3">Rahu Kaal Calculator</h4>
            <p className="text-sm text-white/70 mb-4">
                Calculate the inauspicious time of the day (Rahu Kaal) to avoid starting new ventures. Enter today's sunrise and sunset times for your location.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="w-full">
                    <label htmlFor="sunrise" className="block text-sm font-medium text-galactic-silver/80 mb-1">Sunrise Time</label>
                    <input
                        type="time"
                        id="sunrise"
                        value={sunrise}
                        onChange={(e) => setSunrise(e.target.value)}
                        className="w-full bg-celestial-sapphire/50 border border-cool-cyan/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-aurora-pink focus:border-aurora-pink outline-none transition-all appearance-none"
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
                <div className="w-full">
                    <label htmlFor="sunset" className="block text-sm font-medium text-galactic-silver/80 mb-1">Sunset Time</label>
                    <input
                        type="time"
                        id="sunset"
                        value={sunset}
                        onChange={(e) => setSunset(e.target.value)}
                        className="w-full bg-celestial-sapphire/50 border border-cool-cyan/50 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-aurora-pink focus:border-aurora-pink outline-none transition-all appearance-none"
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
            </div>
             <button
                onClick={calculateRahuKaal}
                className="w-full sm:w-auto bg-aurora-pink text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-aurora-pink/30"
            >
                Calculate for Today
            </button>
            
            {error && <p className="text-aurora-pink text-sm mt-3">{error}</p>}

            {rahuKaal && (
                <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg animate-slide-up text-center">
                    <p className="text-white/80">Today's Rahu Kaal is from:</p>
                    <p className="text-2xl font-bold font-display text-aurora-pink mt-1">{rahuKaal}</p>
                </div>
            )}
        </div>
    );
};

export default RahuKaalCalculator;
