
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/common/Header';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/common/LoadingSpinner';
import type { UserData, WorldClassReport } from './types';
import { calculateInitialNumbers, generateLoshuGrid } from './services/numerologyService';
import { generateWorldClassReport } from './services/geminiService';

type UnlockState = 'locked' | 'unlocking' | 'success' | 'unlocked';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [report, setReport] = useState<WorldClassReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockState, setUnlockState] = useState<UnlockState>('locked');

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
    setIsLoading(true);
    setUserData(data);
    setError(null);
    setReport(null);
    setUnlockState('locked');
    try {
      const { core, compound } = calculateInitialNumbers(data);
      const { missing, overloaded } = generateLoshuGrid(data.dob);
      
      const loshuForAI = { missingNumbers: missing, overloadedNumbers: overloaded };

      const fullReport = await generateWorldClassReport(data, core, compound, loshuForAI);
      setReport(fullReport);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(`An unexpected error occurred while generating your report. Please check your connection and try again. Details: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleReset = useCallback(() => {
      setUserData(null);
      setReport(null);
      setIsLoading(false);
      setError(null);
      setUnlockState('locked');
  }, []);

  const handleUnlock = useCallback(() => {
    setUnlockState('unlocking');
    // Simulate a payment process
    setTimeout(() => {
      setUnlockState('success');
      // After showing success message, show the full report
      setTimeout(() => {
        setUnlockState('unlocked');
      }, 2500);
    }, 2000);
  }, []);

  const renderContent = () => {
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
    if (report && userData) {
      return <Dashboard 
                report={report} 
                userData={userData} 
                onReset={handleReset} 
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
    </div>
  );
};

export default App;
