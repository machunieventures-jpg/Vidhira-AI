
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/common/Header';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/common/LoadingSpinner';
import PaymentModal from './components/common/PaymentModal';
import type { UserData, WorldClassReport } from './types';
import { calculateInitialNumbers, generateLoshuGrid, calculateMulank } from './services/numerologyService';
import { generateWorldClassReport } from './services/geminiService';
import { trackEvent } from './services/analyticsService';

type UnlockState = 'locked' | 'unlocking' | 'success' | 'unlocked';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [report, setReport] = useState<WorldClassReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockState, setUnlockState] = useState<UnlockState>('locked');
  const [isEditing, setIsEditing] = useState(false);
  const [preloadingMessage, setPreloadingMessage] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);


  // Load data from localStorage on initial component mount
  useEffect(() => {
    try {
      const savedReport = localStorage.getItem('vidhiraReport');
      const savedUserData = localStorage.getItem('vidhiraUserData');
      const savedUnlockState = localStorage.getItem('vidhiraUnlockState');

      if (savedReport && savedUserData && savedUnlockState) {
        const reportData: WorldClassReport = JSON.parse(savedReport);
        const userData: UserData = JSON.parse(savedUserData);
        
        setReport(reportData);
        setUserData(userData);
        setUnlockState(savedUnlockState as UnlockState);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
      // If parsing fails, clear localStorage to prevent a broken state
      localStorage.removeItem('vidhiraReport');
      localStorage.removeItem('vidhiraUserData');
      localStorage.removeItem('vidhiraUnlockState');
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return `rgba(255, 215, 0, ${alpha})`; // Return default if invalid hex
    let c = hex.substring(1).split('');
    if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    const i = parseInt(c.join(''), 16);
    const r = (i >> 16) & 255;
    const g = (i >> 8) & 255;
    const b = i & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    if (report?.spiritualAlignment?.luckyColor) {
      const luckyColor = report.spiritualAlignment.luckyColor;
      document.documentElement.style.setProperty('--lucky-color', luckyColor);
      document.documentElement.style.setProperty('--lucky-color-glow', hexToRgba(luckyColor, 0.5));
      document.documentElement.style.setProperty('--lucky-color-glow-faint', hexToRgba(luckyColor, 0.03));
    } else {
        // Reset to default if no report
        document.documentElement.style.setProperty('--lucky-color', '#FFD700');
        document.documentElement.style.setProperty('--lucky-color-glow', 'rgba(255, 215, 0, 0.5)');
        document.documentElement.style.setProperty('--lucky-color-glow-faint', 'rgba(255, 215, 0, 0.03)');
    }
  }, [report]);

  const handleFormSubmit = useCallback(async (data: UserData) => {
    const wasEditing = isEditing;
    // Reset all states
    setUserData(data);
    setError(null);
    setReport(null);
    setUnlockState('locked');
    setIsEditing(false);
    setIsLoading(false);

    // 1. Show the pre-loading message
    const messages = [
        'Generating your cosmic blueprint...',
        'Analyzing your unique vibrational signature...'
    ];
    setPreloadingMessage(messages[Math.floor(Math.random() * messages.length)]);
    
    // 2. Wait for a moment so the user can read it
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Switch to the main loading spinner
    setPreloadingMessage(null);
    setIsLoading(true);

    try {
      // 1. Calculate all numerological data first
      const { core, compound } = calculateInitialNumbers(data);
      const mulank = calculateMulank(data.dob);
      const destinyNumber = core.lifePath;
      
      // 2. Generate the accurate Loshu grid, including birth and destiny numbers
      const { grid, missing, overloaded } = generateLoshuGrid(data.dob, mulank, destinyNumber);
      
      // 3. Prepare data for the AI prompt
      const loshuForAI = { missingNumbers: missing, overloadedNumbers: overloaded };

      // 4. Get the AI-generated part of the report
      const aiReportPart = await generateWorldClassReport(data, core, compound, loshuForAI);
      
      // 5. Assemble the final, complete report
      const fullReport: WorldClassReport = {
        ...aiReportPart,
        loshuAnalysis: {
            ...aiReportPart.loshuAnalysis,
            grid: grid,
            missingNumbers: missing,
            overloadedNumbers: overloaded,
        }
      };

      setReport(fullReport);
      
      // Save to localStorage
      localStorage.setItem('vidhiraReport', JSON.stringify(fullReport));
      localStorage.setItem('vidhiraUserData', JSON.stringify(data));
      localStorage.setItem('vidhiraUnlockState', 'locked');

      // Track analytics event
      if (wasEditing) {
        trackEvent('PROFILE_EDITED', { userName: data.fullName });
      } else {
        trackEvent('REPORT_GENERATED', { userName: data.fullName });
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      
      let userFriendlyMessage = 'An error occurred while generating your report. The cosmic energies seem unstable right now.';

      if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch failed')) {
        userFriendlyMessage = 'A network error occurred. Please check your internet connection and try again.';
      } else if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('malformed')) {
        userFriendlyMessage = 'There might be an issue with the data you provided. Please double-check your name, date, and time of birth for accuracy.';
      } else if (errorMessage.toLowerCase().includes('deadline')) {
        userFriendlyMessage = 'The connection to our cosmic intelligence timed out. This can happen with high demand. Please try again in a moment.';
      } else if (errorMessage.toLowerCase().includes('unstable')) { // Catches the custom error from geminiService
        userFriendlyMessage = 'Our connection to the cosmic intelligence is currently unstable. This is usually temporary. Please wait a few moments and try again.';
      }

      setError(`${userFriendlyMessage} If the problem persists, please contact support.`);
    } finally {
      setIsLoading(false);
    }
  }, [isEditing]);
  
  const handleReset = useCallback(() => {
      setUserData(null);
      setReport(null);
      setIsLoading(false);
      setError(null);
      setUnlockState('locked');
      setIsEditing(false);
      // Clear localStorage
      localStorage.removeItem('vidhiraReport');
      localStorage.removeItem('vidhiraUserData');
      localStorage.removeItem('vidhiraUnlockState');
  }, []);

  const handleUnlock = useCallback(() => {
    setIsPaymentModalOpen(true);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    setUnlockState('unlocking');
    localStorage.setItem('vidhiraUnlockState', 'unlocking');

    // This timeout is just for the "Unlocking..." message on the button
    setTimeout(() => {
        setUnlockState('success');
        localStorage.setItem('vidhiraUnlockState', 'success');
        trackEvent('REPORT_UNLOCKED', { userName: userData?.fullName });
        
        // After showing success message on screen, show the full report
        setTimeout(() => {
            setUnlockState('unlocked');
            localStorage.setItem('vidhiraUnlockState', 'unlocked');
        }, 2500);
    }, 500);
  }, [userData]);


  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);


  const renderContent = () => {
    if (preloadingMessage) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 text-starlight text-center animate-fade-in">
          <p className="font-display text-2xl text-cosmic-gold">{preloadingMessage}</p>
          <p className="text-lunar-grey text-base max-w-sm">
            Please wait a moment as we align the celestial energies to craft your personalized life report.
          </p>
        </div>
      );
    }
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
        return (
            <div className="text-center text-cosmic-gold/90 bg-void-tint p-6 rounded-lg max-w-lg mx-auto border border-lunar-grey/20">
                <p className="font-bold text-lg">Error Generating Report</p>
                <p className="text-starlight/80 mt-2">{error}</p>
                <button onClick={handleReset} className="mt-4 bg-cosmic-gold text-deep-void font-bold py-2 px-4 rounded-lg">Try Again</button>
            </div>
        );
    }
    if (unlockState === 'success') {
        return (
            <div className="text-center animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cosmic-gold/10 border-2 border-cosmic-gold/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cosmic-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold font-display text-starlight">Blueprint Unlocked!</h2>
                <p className="text-lunar-grey mt-2">Enjoy your full, personalized life report.</p>
            </div>
        );
    }
    if (isEditing && userData) {
        return <OnboardingForm onSubmit={handleFormSubmit} initialData={userData} onCancel={handleCancelEdit} />;
    }
    if (report && userData) {
      return <Dashboard 
                report={report} 
                userData={userData} 
                onReset={handleReset}
                onEdit={handleEdit}
                isUnlocked={unlockState === 'unlocked'}
                isUnlocking={unlockState === 'unlocking'}
                onUnlock={handleUnlock}
             />;
    }
    return <OnboardingForm onSubmit={handleFormSubmit} />;
  };

  return (
    <div className="min-h-screen bg-deep-void text-starlight">
      <div className="min-h-screen flex flex-col p-4 selection:bg-cosmic-gold/30">
        <Header />
        <main className="w-full flex-grow flex justify-center py-10">
          {renderContent()}
        </main>
        <footer className="text-center text-xs text-starlight/40 py-4 no-print">
          <p>Vidhira 🔮 &copy; {new Date().getFullYear()}. For Purpose of life.</p>
        </footer>
      </div>
       <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default App;
