import React, { useState } from 'react';
import type { WorldClassReport, UserData, CoreNumberInfo } from '../types';
import NumberCard from './NumberCard';
import LoshuGrid from './LoshuGrid';
import MarkdownRenderer from './common/MarkdownRenderer';
import BrandAnalyzer from './brand/BrandAnalyzer';
import ChatWidget from './chat/ChatWidget';
import YearlyForecast from './forecast/YearlyForecast';
import { calculateMulank } from '../services/numerologyService';
import JyotishFeature from './jyotish/JyotishFeature';
import PdfOptionsModal from './common/PdfOptionsModal';
import CompatibilityList from './common/CompatibilityList';
import CollapsibleSection from './CollapsibleSection';
import { getDailyHoroscope } from '../services/geminiService';
import { trackEvent } from '../services/analyticsService';

// Icons
const Download = ({ size = 20, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const User = ({ size = 20, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const Icons: { [key: string]: React.ReactNode } = {
    Kundali: <span className="text-3xl">✨</span>,
    Jyotish: <span className="text-3xl">🌌</span>,
    CosmicIdentity: <span className="text-3xl">👤</span>,
    LoshuGrid: <span className="text-3xl">🔢</span>,
    Wealth: <span className="text-3xl">💰</span>,
    Health: <span className="text-3xl">🌿</span>,
    Relationships: <span className="text-3xl">❤️</span>,
    Psychology: <span className="text-3xl">🧠</span>,
    Navigator: <span className="text-3xl">🧭</span>,
    Spiritual: <span className="text-3xl">🙏</span>,
    Intellect: <span className="text-3xl">💡</span>,
    Forecast: <span className="text-3xl">🔮</span>,
    Methodology: <span className="text-3xl">⚙️</span>,
    NextSteps: <span className="text-3xl">🚀</span>,
};

const pillarData = [
    { key: 'kundaliSnapshot', title: 'Kundali Snapshot' },
    { key: 'jyotish', title: 'Jyotish Deep Dive' },
    { key: 'cosmicIdentity', title: 'Cosmic Identity' },
    { key: 'loshuAnalysis', title: 'Loshu Grid' },
    { key: 'wealthBusinessCareer', title: 'Wealth & Career' },
    { key: 'healthEnergyWellness', title: 'Health & Wellness' },
    { key: 'relationshipsFamilyLegacy', title: 'Relationships & Family' },
    { key: 'psychologyShadowWork', title: 'Psychology & Shadow Work' },
    { key: 'dailyNavigator', title: 'Daily Navigator' },
    { key: 'spiritualAlignment', title: 'Spiritual Alignment' },
    { key: 'intellectEducation', title: 'Intellect & Education' },
    { key: 'futureForecast', title: 'Future Forecast' },
    { key: 'methodology', title: 'Methodology' },
    { key: 'nextSteps', title: 'Your Journey Continues' },
];

interface DashboardProps {
  report: WorldClassReport;
  userData: UserData;
  onReset: () => void;
}

const CoreNumberCard: React.FC<{label: string, value: number}> = ({ label, value }) => (
    <div className="glass-card text-center animate-slide-up">
        <div className="mx-auto mb-3 text-4xl font-bold gradient-text" style={{ fontFamily: 'Cinzel, serif' }}>
            {value}
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
            {label.replace(/([A-Z])/g, ' $1').trim()}
        </p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ report, userData, onReset }) => {
  const { cosmicIdentity, loshuAnalysis, relationshipsFamilyLegacy, futureForecast, spiritualAlignment, methodology } = report;
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [dailyHoroscope, setDailyHoroscope] = useState<string | null>(null);
  const [isHoroscopeLoading, setIsHoroscopeLoading] = useState(false);
  const [horoscopeError, setHoroscopeError] = useState<string | null>(null);

  const handleFetchDailyHoroscope = async () => {
    setIsHoroscopeLoading(true);
    setDailyHoroscope(null);
    setHoroscopeError(null);
    try {
        const mulank = calculateMulank(userData.dob);
        const horoscope = await getDailyHoroscope(mulank, userData.fullName, userData.language);
        setDailyHoroscope(horoscope);
        trackEvent('DAILY_HOROSCOPE_GENERATED', { mulank });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setHoroscopeError(errorMessage);
    } finally {
        setIsHoroscopeLoading(false);
    }
  };

  const renderPillarContent = (pillarKey: string) => {
    switch (pillarKey) {
        case 'kundaliSnapshot':
            return <MarkdownRenderer content={report.kundaliSnapshot.summary} />;
        case 'jyotish':
            return <JyotishFeature userData={userData} />;
        case 'cosmicIdentity':
            return (
                 <div className="space-y-4">
                    {Object.entries(cosmicIdentity.coreNumbers).map(([key, value]) => (
                        <NumberCard 
                          key={key}
                          title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                          data={value} 
                          className="bg-purple-50/50 dark:bg-purple-900/20"
                        />
                    ))}
                </div>
            );
        case 'loshuAnalysis':
            return <LoshuGrid grid={loshuAnalysis.grid} missingNumbers={loshuAnalysis.missingNumbers} overloadedNumbers={loshuAnalysis.overloadedNumbers} userData={userData} birthNumber={calculateMulank(userData.dob)} destinyNumber={cosmicIdentity.coreNumbers.lifePath.number} elementalPlanes={loshuAnalysis.elementalPlanes} isUnlocked={true} />;
        case 'relationshipsFamilyLegacy':
            return (
                <>
                    <MarkdownRenderer content={relationshipsFamilyLegacy.content} />
                    <hr className="my-6 border-gray-200 dark:border-gray-700"/>
                    <CompatibilityList title="Life Path Compatibility" pairings={relationshipsFamilyLegacy.compatibilityAnalysis.lifePath} />
                </>
            );
        case 'wealthBusinessCareer':
            return (
                 <>
                    <MarkdownRenderer content={report.wealthBusinessCareer.content} />
                    <hr className="my-6 border-gray-200 dark:border-gray-700"/>
                    <BrandAnalyzer userData={userData} report={report} />
                 </>
            );
        case 'futureForecast':
             return (
                <>
                    <NumberCard title="Personal Year" data={futureForecast.personalYear} className="bg-purple-50/50 dark:bg-purple-900/20"/>
                     <hr className="my-6 border-gray-200 dark:border-gray-700"/>
                    <MarkdownRenderer content={futureForecast.strategicRoadmap.content} />
                     <hr className="my-6 border-gray-200 dark:border-gray-700"/>
                    <YearlyForecast userData={userData} />
                </>
            );
         case 'spiritualAlignment':
            return (
                <>
                  <MarkdownRenderer content={spiritualAlignment.content} />
                   {spiritualAlignment.mantrasAndAffirmations?.length > 0 && (
                  <>
                    <hr className="my-8 border-gray-200 dark:border-gray-700" />
                    <h4 className="text-xl font-bold gradient-text mb-4">Personalized Mantras</h4>
                    <div className="space-y-4">
                      {spiritualAlignment.mantrasAndAffirmations.map((mantra, i) => (
                        <blockquote key={i} className="border-l-4 border-[--cosmic-purple] pl-4 py-2 bg-purple-50 dark:bg-purple-900/20">
                          <p className="text-lg italic text-gray-800 dark:text-gray-200">"{mantra}"</p>
                        </blockquote>
                      ))}
                    </div>
                  </>
                )}
                </>
            );
         case 'methodology':
             return  <p className="text-sm text-gray-500 dark:text-gray-400">{methodology.disclaimer}</p>;
         case 'nextSteps':
             return  <p className="text-gray-600 dark:text-gray-300">Your journey of self-discovery has just begun. Use these insights as a compass to navigate your life with greater awareness and purpose.</p>;
        default:
            const pillar = (report as any)[pillarKey];
            return pillar?.content ? <MarkdownRenderer content={pillar.content} /> : null;
    }
  }

  return (
    <>
      <div className="min-h-screen p-4 md:p-8 relative z-10">
        <div id="report-container" className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="glass-card mb-8 flex flex-col sm:flex-row items-center justify-between animate-slide-up">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Welcome Back, {userData.fullName?.split(' ')[0]}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Your cosmic dashboard is fully activated ✨</p>
            </div>
            <div className="flex gap-3 mt-4 sm:mt-0">
              <button className="btn-cosmic" onClick={() => setIsPdfModalOpen(true)}>
                <Download size={20} /> Export
              </button>
              <button className="btn-cosmic" onClick={onReset}>
                <User size={20} /> New Report
              </button>
            </div>
          </div>

          {/* Core Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             {Object.entries(cosmicIdentity.coreNumbers).slice(0, 4).map(([key, value]) => (
                <CoreNumberCard key={key} label={key} value={(value as CoreNumberInfo).number} />
             ))}
          </div>

          {/* Report Sections */}
          <div className="space-y-4">
            {pillarData.map((pillar, idx) => (
              <CollapsibleSection
                key={pillar.key}
                title={pillar.title}
                icon={Icons[pillar.key.charAt(0).toUpperCase() + pillar.key.slice(1).replace(/([A-Z])/g, '')] || Icons.Kundali}
                data-section-key={pillar.key}
                animationDelay={idx * 100}
              >
                {renderPillarContent(pillar.key)}
              </CollapsibleSection>
            ))}
          </div>

          {/* AI-Powered Insights Section */}
          <div className="glass-card mt-8 animate-slide-up" style={{ animationDelay: `${pillarData.length * 100}ms` }}>
              <h3 className="text-2xl font-bold gradient-text mb-4 flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                <span className="text-2xl mr-2">✨</span>AI-Powered Insights
              </h3>
              <div className="flex flex-col items-start w-full">
                  <button 
                      className="btn-cosmic"
                      onClick={handleFetchDailyHoroscope}
                      disabled={isHoroscopeLoading}
                  >
                      {isHoroscopeLoading ? 'Consulting Cosmos...' : (dailyHoroscope ? 'Refresh Daily Horoscope' : 'Get Daily Horoscope')}
                  </button>

                  <div className="mt-6 w-full">
                    {isHoroscopeLoading && (
                        <div className="flex flex-col items-center justify-center space-y-3 text-center p-4 animate-slide-up">
                            <div className="loading-mandala !w-12 !h-12 !border-4"></div>
                            <p className="font-semibold text-gray-600 dark:text-gray-300">Receiving Today's Cosmic Transmission...</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Aligning with celestial energies for your personalized insight.</p>
                        </div>
                    )}
                    
                    {horoscopeError && (
                         <div className="p-4 text-center">
                            <p className="text-[--rose-accent] text-sm">{horoscopeError}</p>
                        </div>
                    )}
                    
                    {dailyHoroscope && !isHoroscopeLoading && (
                        <div className="p-4 w-full bg-purple-50 dark:bg-purple-900/20 rounded-lg animate-slide-up">
                            <MarkdownRenderer content={dailyHoroscope} />
                        </div>
                    )}
                  </div>
              </div>
          </div>

        </div>
      </div>
      <ChatWidget report={report} userData={userData} />
      <PdfOptionsModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        userName={userData.fullName}
       />
    </>
  );
};

export default Dashboard;