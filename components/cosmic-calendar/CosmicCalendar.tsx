import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getMonthlyCalendarInsights } from '../../services/geminiService';
import type { UserData, WorldClassReport, CalendarDayInsight, CoreNumbers } from '../../types';
import { trackEvent } from '../../services/analyticsService';

interface CosmicCalendarProps {
    userData: UserData;
    report: WorldClassReport;
}

const CosmicCalendar: React.FC<CosmicCalendarProps> = ({ userData, report }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [insights, setInsights] = useState<CalendarDayInsight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<CalendarDayInsight | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    const fetchInsights = useCallback(async (fetchYear: number, fetchMonth: number) => {
        setIsLoading(true);
        setError(null);
        setSelectedDay(null);
        try {
             const coreNumbersForApi: CoreNumbers = {
                lifePath: report.cosmicIdentity.coreNumbers.lifePath.number,
                expression: report.cosmicIdentity.coreNumbers.expression.number,
                soulUrge: report.cosmicIdentity.coreNumbers.soulUrge.number,
                personality: report.cosmicIdentity.coreNumbers.personality.number,
                maturity: report.cosmicIdentity.coreNumbers.maturity.number,
                personalYear: report.futureForecast.personalYear.number,
            };
            const result = await getMonthlyCalendarInsights(
                coreNumbersForApi,
                userData.fullName,
                fetchMonth + 1, // Service expects 1-12
                fetchYear,
                userData.language
            );
            setInsights(result);
            trackEvent('CALENDAR_VIEWED', { month: fetchMonth + 1, year: fetchYear });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [userData, report]);

    useEffect(() => {
        fetchInsights(year, month);
    }, [year, month, fetchInsights]);

    const { daysInMonth, firstDayOfMonth } = useMemo(() => {
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
        return { daysInMonth: days, firstDayOfMonth: firstDay };
    }, [year, month]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const getRatingColor = (rating: 'good' | 'medium' | 'bad') => {
        switch (rating) {
            case 'good': return 'bg-[--sage-green] border-green-400';
            case 'medium': return 'bg-[--gold-accent] border-yellow-400';
            case 'bad': return 'bg-[--rose-accent] border-red-400';
            default: return 'bg-gray-500 border-gray-400';
        }
    };
    
    const getRatingBgColor = (rating: 'good' | 'medium' | 'bad') => {
        switch (rating) {
            case 'good': return 'bg-green-500/20';
            case 'medium': return 'bg-yellow-500/20';
            case 'bad': return 'bg-red-500/20';
            default: return 'bg-gray-500/20';
        }
    };

    const dayBlanks = Array(firstDayOfMonth).fill(null);
    const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <button onClick={handlePrevMonth} className="btn-cosmic !p-2 !rounded-full !w-10 !h-10" aria-label="Previous month">&lt;</button>
                <h3 className="text-xl font-bold gradient-text text-center" style={{ fontFamily: 'Cinzel, serif' }}>
                    {currentDate.toLocaleString(userData.language, { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={handleNextMonth} className="btn-cosmic !p-2 !rounded-full !w-10 !h-10" aria-label="Next month">&gt;</button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 dark:text-gray-400 pb-2 border-b border-gray-200 dark:border-gray-700">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="p-1">{day}</div>)}
            </div>
            
            {isLoading ? (
                 <div className="flex items-center justify-center p-10">
                    <div className="loading-mandala !w-12 !h-12 !border-4"></div>
                </div>
            ) : error ? (
                <div className="text-center p-4 text-[--rose-accent] bg-red-500/10 rounded-lg">{error}</div>
            ) : (
                <div className="grid grid-cols-7 gap-1">
                    {dayBlanks.map((_, i) => <div key={`blank-${i}`} className="border border-transparent" />)}
                    {dayCells.map(day => {
                        const insight = insights.find(i => i.day === day);
                        return (
                            <div
                                key={day}
                                className={`relative aspect-square p-1.5 border rounded-md transition-all duration-200 text-left
                                    ${insight ? 'cursor-pointer hover:bg-purple-100/50 dark:hover:bg-purple-900/50' : 'bg-gray-100/50 dark:bg-gray-800/20 text-gray-400'}
                                    ${selectedDay?.day === day ? 'ring-2 ring-[--cosmic-purple] bg-purple-100/80 dark:bg-purple-900/40' : 'border-gray-200 dark:border-gray-700/50'}
                                `}
                                onClick={() => insight && setSelectedDay(insight)}
                            >
                                <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">{day}</span>
                                {insight && <div className={`absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full ${getRatingColor(insight.rating)}`}></div>}
                            </div>
                        );
                    })}
                </div>
            )}
            
            {selectedDay && (
                <div className={`p-4 ${getRatingBgColor(selectedDay.rating)} rounded-lg animate-slide-up mt-4 border-l-4 ${getRatingColor(selectedDay.rating)}`}>
                    <div className="flex items-center gap-3 mb-2">
                         <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{selectedDay.day} {currentDate.toLocaleString(userData.language, { month: 'long' })}: {selectedDay.title}</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{selectedDay.advice}</p>
                </div>
            )}
        </div>
    );
};

export default CosmicCalendar;
