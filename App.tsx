
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

    const validateReport = (report: any): boolean => {
        // Use optional chaining to safely check for nested properties without crashing
        // Specifically check for the 'number' property on core numeric objects to prevent rendering errors
        return !!(
            report?.cosmicIdentity?.coreNumbers?.lifePath?.number && 
            report?.relationshipsFamilyLegacy?.compatibilityAnalysis &&
            report?.futureForecast?.personalYear?.number
        );
    };

    useEffect(() => {
        try {
            const savedUserData = localStorage.getItem('vidhiraUserData');
            const savedReport = localStorage.getItem('vidhiraReport');
            const savedUnlockStatus = localStorage.getItem('vidhiraUnlockStatus');

            if (savedUserData && savedReport) {
                const parsedReport = JSON.parse(savedReport);
                if (validateReport(parsedReport)) {
                    setUserData(JSON.parse(savedUserData));
                    setReport(parsedReport);
                    const unlocked = savedUnlockStatus === 'true';
                    setIsPremium(unlocked);
                    setCurrentView(unlocked ? 'dashboard' : 'summary');
                } else {
                    console.warn("Saved report is invalid or incomplete. Resetting state.");
                    handleReset();
                }
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
                            <h3 className="text-2xl font-bold text-[--rose-accent]">Cosmic Disturbance</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-4">{error}</p>
                             <button
                                onClick={handleReset}
                                className="btn-cosmic w-full mt-6"
                            >
                                Return to Start
                            </button>
                        </div>
                    </div>
                 );
             case 'summary':
                return report && userData ? (
                    <BlueprintSummary 
                        report={report} 
                        userData={userData} 
                        onUnlock={handleUnlockReport} 
                    />
                ) : null;
            case 'dashboard':
                return report && userData ? (
                    <Dashboard 
                        report={report} 
                        userData={userData} 
                        onReset={handleReset} 
                        theme={theme} 
                        setTheme={setTheme} 
                        onUpdateUserData={handleUpdateUserData}
                    />
                ) : null;
            default: // onboarding
                 return (
                    <OnboardingForm 
                        onSubmit={handleGenerateReport} 
                        isLoading={isLoading} 
                    />
                 );
        }
    };

    return (
        <>
            {isPremium && <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[--cosmic-purple] to-[--gold-accent] z-50"></div>}
            {renderCurrentView()}
             <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
            />
             {toastMessage && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-slide-up flex items-center gap-2">
                    <Check size={16} className="text-green-400" />
                    {toastMessage}
                </div>
            )}
        </>
    );
};

export default App;
