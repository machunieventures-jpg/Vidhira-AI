
import React, { useState, useCallback } from 'react';
import Header from './components/common/Header';
import OnboardingForm from './components/OnboardingForm';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/common/LoadingSpinner';
import type { UserData, WorldClassReport } from './types';
import { calculateInitialNumbers, generateLoshuGrid } from './services/numerologyService';
import { generateWorldClassReport } from './services/geminiService';

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [report, setReport] = useState<WorldClassReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(async (data: UserData) => {
    setIsLoading(true);
    setUserData(data);
    setError(null);
    setReport(null);
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
  
  const handleReset = () => {
      setUserData(null);
      setReport(null);
      setIsLoading(false);
      setError(null);
  }

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
    if (report && userData) {
      return <Dashboard report={report} userData={userData} onReset={handleReset} />;
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
        <footer className="text-center text-xs text-starlight/40 py-4">
          <p>Vidhira 🔮 &copy; {new Date().getFullYear()}. For Purpose of life.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;