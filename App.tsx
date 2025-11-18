import React, { useState, useEffect, useCallback } from 'react';
import type { UserData, WorldClassReport, LoshuAnalysisPillar, CoreNumbers, CompoundNumbers, KarmicDebtNumbers } from './types';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import PaymentModal from './components/common/PaymentModal';
import BlueprintSummary from './components/BlueprintSummary';
import { calculateInitialNumbers, generateLoshuGrid, calculateMulank, calculateKuaNumber } from './services/numerologyService';
import {
    generateCosmicIdentityPillar,
    generateRelationshipsPillar,
    generateLoshuAnalysisPillar,
    generateFutureForecastPillar,
    generateSpiritualAlignmentPillar,
    generateSimplePillarContent,
    generateKundaliSnapshot,
    generateMethodologyPillar
} from './services/geminiService';
import { trackEvent } from './services/analyticsService';
import { Check } from './components/common/Icons';
import LoadingMandala from './components/common/LoadingMandala';

type AppView = 'onboarding' | 'summary' | 'dashboard' | 'loading' | 'error';
export type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [report, setReport] = useState<WorldClassReport | null>(null);
    const [currentView, setCurrentView] = useState<AppView>('onboarding');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');

    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('vidhiraTheme');
            if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
        }
        return 'dark';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('vidhiraTheme', theme);
    }, [theme]);

    useEffect(() => {
        // Generate stars for background
        const starsContainer = document.querySelector('.stars');
        if (starsContainer && starsContainer.children.length === 0) {
            const starCount = 100;
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = `${Math.random() * 100}%`;
                star.style.top = `${Math.random() * 100}%`;
                star.style.animationDelay = `${Math.random() * 3}s`;
                starsContainer.appendChild(star);
            }
        }
    }, []);

    const showNotification = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    useEffect(() => {
        try {
            const savedUserData = localStorage.getItem('vidhiraUserData');
            const savedReport = localStorage.getItem('vidhiraReport');
            const savedUnlockStatus = localStorage.getItem('vidhiraUnlockStatus');

            if (savedUserData && savedReport) {
                setUserData(JSON.parse(savedUserData));
                setReport(JSON.parse(savedReport));
                const unlocked = savedUnlockStatus === 'true';
                setIsPremium(unlocked);
                setCurrentView(unlocked ? 'dashboard' : 'summary');
            }
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
            handleReset();
        }
    }, []);

    const handleGenerateReport = useCallback(async (data: UserData) => {
        setIsLoading(true);
        setCurrentView('loading');
        setError(null);
        setUserData(data);
        setReport(null);
        setIsPremium(false);

        try {
            // 1. Local Calculations
            const { core, compound, karmicDebt } = calculateInitialNumbers(data);
            const mulank = calculateMulank(data.dob);
            const kuaNumber = calculateKuaNumber(data.dob, data.gender);
            const { grid, missing, overloaded } = generateLoshuGrid(data.dob, mulank, core.lifePath, kuaNumber);
            
            const loshuForAI: Pick<LoshuAnalysisPillar, 'missingNumbers' | 'overloadedNumbers'> = { missingNumbers: missing, overloadedNumbers: overloaded };

            // 2. Parallel AI Calls for all report pillars
            const [
                cosmicIdentity,
                relationshipsFamilyLegacy,
                loshuAnalysis,
                futureForecast,
                spiritualAlignment,
                wealthBusinessCareer,
                healthEnergyWellness,
                psychologyShadowWork,
                dailyNavigator,
                intellectEducation,
                kundaliSnapshot,
                methodology,
            ] = await Promise.all([
                generateCosmicIdentityPillar(data, core, compound, karmicDebt),
                generateRelationshipsPillar(data, core),
                generateLoshuAnalysisPillar(data, loshuForAI),
                generateFutureForecastPillar(data, core, compound),
                generateSpiritualAlignmentPillar(data, core),
                generateSimplePillarContent("Wealth, Business & Career", data, core),
                generateSimplePillarContent("Health, Energy & Wellness", data, core),
                generateSimplePillarContent("Psychology & Shadow Work", data, core),
                generateSimplePillarContent("Daily Navigator", data, core),
                generateSimplePillarContent("Intellect & Education", data, core),
                generateKundaliSnapshot(data),
                generateMethodologyPillar(data.language),
            ]);

            // 3. Assemble Final Report
            const finalReport: WorldClassReport = {
                cosmicIdentity,
                relationshipsFamilyLegacy,
                loshuAnalysis: { ...loshuAnalysis, grid, missingNumbers: missing, overloadedNumbers: overloaded },
                futureForecast,
                spiritualAlignment,
                wealthBusinessCareer,
                healthEnergyWellness,
                psychologyShadowWork,
                dailyNavigator,
                intellectEducation,
                kundaliSnapshot,
                methodology,
            };

            setReport(finalReport);
            setCurrentView('summary');
            trackEvent('REPORT_GENERATED', { lifePath: core.lifePath });

            localStorage.setItem('vidhiraUserData', JSON.stringify(data));
            localStorage.setItem('vidhiraReport', JSON.stringify(finalReport));
            localStorage.setItem('vidhiraUnlockStatus', 'false');
            showNotification('Your cosmic blueprint is ready! ✨');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate the complete numerology report. The cosmic energies are currently unstable. Please try again.`);
            setCurrentView('error');
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleReset = () => {
        setUserData(null);
        setReport(null);
        setError(null);
        setIsPremium(false);
        setCurrentView('onboarding');
        localStorage.removeItem('vidhiraUserData');
        localStorage.removeItem('vidhiraReport');
        localStorage.removeItem('vidhiraUnlockStatus');
    };

    const handleUnlockReport = () => {
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        setIsPremium(true);
        setCurrentView('dashboard');
        trackEvent('REPORT_UNLOCKED');
        showNotification('Welcome to your full cosmic dashboard! 🌟');
        localStorage.setItem('vidhiraUnlockStatus', 'true');
    };
    
    const handleUpdateUserData = (newUserData: UserData) => {
        setUserData(newUserData);
        localStorage.setItem('vidhiraUserData', JSON.stringify(newUserData));
        showNotification('Settings saved successfully!');
    };


    const renderCurrentView = () => {
        switch (currentView) {
            case 'loading':
                return <div className="min-h-screen flex items-center justify-center"><LoadingMandala /></div>;
            case 'error':
                 return (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="glass-card text-center max-w-md">
                            <h3 className="text-2xl font-bold text-[--rose-accent]">An Error Occurred</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">{error}</p>
                            <button onClick={handleReset} className="btn-cosmic mt-4">Start Over</button>
                        </div>
                    </div>
                );
            case 'summary':
                if (report && userData) {
                    return <BlueprintSummary report={report} userData={userData} onUnlock={handleUnlockReport} />;
                }
                handleReset(); // Should not happen, reset to be safe
                return null;
            case 'dashboard':
                if (report && userData) {
                    return <Dashboard report={report} userData={userData} onReset={handleReset} theme={theme} setTheme={setTheme} onUpdateUserData={handleUpdateUserData} />;
                }
                handleReset(); // Should not happen, reset to be safe
                return null;
            case 'onboarding':
            default:
                return <OnboardingForm onSubmit={handleGenerateReport} isLoading={isLoading} />;
        }
    };

    return (
        <>
            <main className="min-h-screen p-4 relative">
                {renderCurrentView()}
            </main>
            {toastMessage && (
                <div className="toast fixed top-6 right-1/2 translate-x-1/2 z-50 animate-slide-up">
                     <div className="bg-white dark:bg-[--cosmic-blue] p-4 rounded-xl shadow-lg flex items-center gap-3 border border-gray-200 dark:border-gray-700">
                        <Check size={20} className="text-[--sage-green]" />
                        <span className="font-medium text-[--cosmic-blue] dark:text-[--stardust]">{toastMessage}</span>
                    </div>
                </div>
            )}
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </>
    );
};

export default App;