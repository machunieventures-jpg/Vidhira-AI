import React, { useState, useEffect } from 'react';
import type { WorldClassReport, UserData, CoreNumberInfo, PillarContent } from '../types';
import NumberCard from './NumberCard';
import LoshuGrid from './LoshuGrid';
import MarkdownRenderer from './common/MarkdownRenderer';
import BrandAnalyzer from './brand/BrandAnalyzer';
import ChatWidget from './chat/ChatWidget';
import YearlyForecast from './forecast/YearlyForecast';
import { calculateMulank, calculateKuaNumber } from '../services/numerologyService';
import JyotishFeature from './jyotish/JyotishFeature';
import PdfOptionsModal from './common/PdfOptionsModal';
import CompatibilityList from './common/CompatibilityList';
import CollapsibleSection from './CollapsibleSection';
import { getDailyHoroscope } from '../services/geminiService';
import { trackEvent } from '../services/analyticsService';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Download, User, Volume2, StopCircle, Loader } from './common/Icons';
import ImageEditor from './ImageEditor';
import BirthDestinyCombination from './BirthDestinyCombination';
import TableOfContents from './common/TableOfContents';
import CosmicCalendar from './cosmic-calendar/CosmicCalendar';

const Icons: { [key: string]: React.ReactNode } = {
    Kundali: <span className="text-3xl">✨</span>,
    Jyotish: <span className="text-3xl">🌌</span>,
    CosmicIdentity: <span className="text-3xl">👤</span>,
    BirthDestinyCombination: <span className="text-3xl">🔗</span>,
    LoshuGrid: <span className="text-3xl">🔢</span>,
    Wealth: <span className="text-3xl">💰</span>,
    Health: <span className="text-3xl">🌿</span>,
    Relationships: <span className="text-3xl">❤️</span>,
    Psychology: <span className="text-3xl">🧠</span>,
    ImageEditor: <span className="text-3xl">🖼️</span>,
    Navigator: <span className="text-3xl">🧭</span>,
    Spiritual: <span className="text-3xl">🙏</span>,
    Intellect: <span className="text-3xl">💡</span>,
    Forecast: <span className="text-3xl">🔮</span>,
    CosmicCalendar: <span className="text-3xl">🗓️</span>,
    Methodology: <span className="text-3xl">⚙️</span>,
    NextSteps: <span className="text-3xl">🚀</span>,
    AiInsights: <span className="text-3xl">🤖</span>,
};

const pillarData = [
    { key: 'kundaliSnapshot', title: 'Kundali Snapshot' },
    { key: 'jyotish', title: 'Jyotish Deep Dive' },
    { key: 'cosmicIdentity', title: 'Cosmic Identity' },
    { key: 'birthDestinyCombination', title: 'Birth & Destiny Analysis' },
    { key: 'loshuAnalysis', title: 'Loshu Grid' },
    { key: 'wealthBusinessCareer', title: 'Wealth & Career' },
    { key: 'healthEnergyWellness', title: 'Health & Wellness' },
    { key: 'relationshipsFamilyLegacy', title: 'Relationships & Family' },
    { key: 'psychologyShadowWork', title: 'Psychology & Shadow Work' },
    { key: 'imageEditor', title: 'Cosmic Image Editor' },
    { key: 'dailyNavigator', title: 'Daily Navigator' },
    { key: 'spiritualAlignment', title: 'Spiritual Alignment' },
    { key: 'intellectEducation', title: 'Intellect & Education' },
    { key: 'cosmicCalendar', title: 'Cosmic Calendar' },
    { key: 'futureForecast', title: 'Future Forecast' },
    { key: 'methodology', title: 'Methodology' },
    { key: 'nextSteps', title: 'Your Journey Continues' },
];

const aiInsightsPillar = { key: 'ai-insights', title: 'AI-Powered Insights' };

const sectionsForToc = [
    ...pillarData.map(p => ({ key: p.key, title: p.title })),
    aiInsightsPillar
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

const JournalPrompt: React.FC<{ prompt?: string }> = ({ prompt }) => {
    if (!prompt) return null;
    return (
        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-[--cosmic-purple]">
            <h5 className="font-bold text-gray-700 dark:text-gray-200 mb-2">✍️ AI Reflection Coach</h5>
            <p className="italic text-gray-600 dark:text-gray-300">"{prompt}"</p>
        </div>
    );
};

const PillarContentRenderer: React.FC<{ pillar?: PillarContent }> = ({ pillar }) => {
    if (!pillar?.content) return null;
    return (
        <>
            <MarkdownRenderer content={pillar.content} />
            <JournalPrompt prompt={pillar.journalPrompt} />
        </>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ report, userData, onReset }) => {
  const { cosmicIdentity, loshuAnalysis, relationshipsFamilyLegacy, futureForecast, spiritualAlignment, methodology } = report;
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [dailyHoroscope, setDailyHoroscope] = useState<string | null>(null);
  const [isHoroscopeLoading, setIsHoroscopeLoading] = useState(false);
  const [horoscopeError, setHoroscopeError] = useState<string | null>(null);
  const audioPlayer = useAudioPlayer();
  const [activeSection, setActiveSection] = useState<string>(pillarData[0].key);
  
  useEffect(() => {
    let lastActiveSection: string | null = null;
    const observer = new IntersectionObserver(
        (entries) => {
            const visibleSections = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

            if (visibleSections.length > 0) {
                const newActiveSection = visibleSections[0].target.getAttribute('data-section-key');
                if (newActiveSection && newActiveSection !== lastActiveSection) {
                    lastActiveSection = newActiveSection;
                    setActiveSection(newActiveSection);
                }
            }
        },
        {
            rootMargin: '0px 0px -80% 0px', // Active when element top is in the top 20% of viewport
            threshold: 0,
        }
    );

    const sectionElements = document.querySelectorAll('[data-section-key]');
    sectionElements.forEach((el) => observer.observe(el));

    return () => {
        sectionElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleNavigate = (key: string) => {
      const sectionElement = document.querySelector(`[data-section-key="${key}"]`);
      if (sectionElement) {
          sectionElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
          });
      }
  };


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
            return (
                 <>
                    <MarkdownRenderer content={report.kundaliSnapshot.summary} />
                    <div className="mt-4">
                        <button 
                            className="btn-cosmic !py-2 !px-4"
                            onClick={() => audioPlayer.isPlaying ? audioPlayer.stop() : audioPlayer.play(report.kundaliSnapshot.summary)}
                            disabled={audioPlayer.isLoading}
                        >
                            {audioPlayer.isLoading ? <><Loader size={20}/> Synthesizing...</> :
                             audioPlayer.isPlaying ? <><StopCircle size={20} /> Stop Reading</> :
                             <><Volume2 size={20} /> Read Aloud</>}
                        </button>
                        {audioPlayer.error && <p className="text-sm text-[--rose-accent] mt-2">{audioPlayer.error}</p>}
                    </div>
                </>
            );
        case 'jyotish':
            return <JyotishFeature userData={userData} />;
        case 'cosmicIdentity':
            return (
                 <div className="space-y-6">
                    {Object.entries(cosmicIdentity.coreNumbers)
                      .filter(([key, value]) => !(key === 'soulUrge' && (value as CoreNumberInfo).number === 5))
                      .map(([key, value]) => (
                        <NumberCard 
                          key={key}
                          title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                          data={value as CoreNumberInfo} 
                          className="bg-purple-50/50 dark:bg-purple-900/20"
                        />
                    ))}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-xl font-bold gradient-text mb-3">Soul Synopsis</h4>
                        <PillarContentRenderer pillar={cosmicIdentity.soulSynopsis} />
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-xl font-bold gradient-text mb-3">Famous Parallels</h4>
                        <PillarContentRenderer pillar={cosmicIdentity.famousParallels} />
                    </div>
                     <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-xl font-bold gradient-text mb-3">Planetary Rulerships</h4>
                        <PillarContentRenderer pillar={cosmicIdentity.planetaryRulerships} />
                    </div>
                </div>
            );
        case 'birthDestinyCombination':
            const birthNum = calculateMulank(userData.dob);
            const destinyNum = cosmicIdentity.coreNumbers.lifePath.number;
            return <BirthDestinyCombination birthNumber={birthNum} destinyNumber={destinyNum} userData={userData} />;
        case 'loshuAnalysis':
            const mulank = calculateMulank(userData.dob);
            const kuaNumber = calculateKuaNumber(userData.dob, userData.gender);
            return <LoshuGrid grid={loshuAnalysis.grid} missingNumbers={loshuAnalysis.missingNumbers} overloadedNumbers={loshuAnalysis.overloadedNumbers} userData={userData} birthNumber={mulank} destinyNumber={cosmicIdentity.coreNumbers.lifePath.number} kuaNumber={kuaNumber} planes={loshuAnalysis.planes} isUnlocked={true} />;
        case 'relationshipsFamilyLegacy':
            return (
                <>
                    <PillarContentRenderer pillar={relationshipsFamilyLegacy} />

                    {relationshipsFamilyLegacy.friendlyAndEnemyNumbers && (
                      <>
                        <hr className="my-8 border-gray-200 dark:border-gray-700" />
                        <h4 className="text-xl font-bold gradient-text mb-3">Friendly & Enemy Number Analysis</h4>
                        <PillarContentRenderer pillar={relationshipsFamilyLegacy.friendlyAndEnemyNumbers} />
                      </>
                    )}

                    <hr className="my-8 border-gray-200 dark:border-gray-700" />
                    <CompatibilityList title="Life Path Compatibility" pairings={relationshipsFamilyLegacy.compatibilityAnalysis.lifePath} />
                    <hr className="my-6 border-gray-200 dark:border-gray-700"/>
                    <CompatibilityList title="Expression Number Compatibility" pairings={relationshipsFamilyLegacy.compatibilityAnalysis.expression} />
                </>
            );
        case 'wealthBusinessCareer':
            return (
                 <>
                    <PillarContentRenderer pillar={report.wealthBusinessCareer} />
                    <hr className="my-6 border-gray-200 dark:border-gray-700"/>
                    <BrandAnalyzer userData={userData} report={report} />
                 </>
            );
        case 'imageEditor':
            return <ImageEditor />;
        case 'cosmicCalendar':
            return <CosmicCalendar userData={userData} report={report} />;
        case 'futureForecast':
             return (
                <>
                    <NumberCard title="Personal Year" data={futureForecast.personalYear} className="bg-purple-50/50 dark:bg-purple-900/20"/>
                     <hr className="my-6 border-gray-200 dark:border-gray-700"/>
                    <PillarContentRenderer pillar={futureForecast.strategicRoadmap} />
                     <hr className="my-6 border-gray-200 dark:border-gray-700"/>
                    <YearlyForecast userData={userData} />
                </>
            );
         case 'spiritualAlignment':
            return (
                <>
                  <PillarContentRenderer pillar={spiritualAlignment} />
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
            return pillar?.content ? <PillarContentRenderer pillar={pillar} /> : null;
    }
  }

  return (
    <>
      <div className="min-h-screen p-4 md:p-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <TableOfContents
            sections={sectionsForToc}
            activeSection={activeSection}
            onNavigate={handleNavigate}
          />
          <div id="report-container" className="flex-1 min-w-0">
            {/* Header */}
            <div className="glass-card mb-8 flex flex-col sm:flex-row items-center justify-between animate-slide-up">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Welcome Back, {userData.fullName?.split(' ')[0]}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">Your cosmic dashboard is fully activated ✨</p>
              </div>
              <div className="flex gap-3 mt-4 sm:mt-0">
                <button className="btn-cosmic no-print" onClick={() => setIsPdfModalOpen(true)}>
                  <Download size={20} /> Export
                </button>
                <button className="btn-cosmic no-print" onClick={onReset}>
                  <User size={20} /> New Report
                </button>
              </div>
            </div>

            {/* Core Numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               {Object.entries(cosmicIdentity.coreNumbers)
                      .slice(0, 4)
                      .filter(([key, value]) => !(key === 'soulUrge' && (value as CoreNumberInfo).number === 5))
                      .map(([key, value]) => (
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
                  tooltipText={pillar.key === 'methodology' ? report.methodology.disclaimer : undefined}
                >
                  {renderPillarContent(pillar.key)}
                </CollapsibleSection>
              ))}
            </div>

            {/* AI-Powered Insights Section */}
            <div data-section-key={aiInsightsPillar.key} className="glass-card mt-8 animate-slide-up" style={{ animationDelay: `${pillarData.length * 100}ms` }}>
                <h3 className="text-2xl font-bold gradient-text mb-4 flex items-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                  <span className="text-2xl mr-2">🤖</span>{aiInsightsPillar.title}
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