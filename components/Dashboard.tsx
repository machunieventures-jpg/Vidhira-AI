import React from 'react';
import type { WorldClassReport, UserData } from '../types';
import ReportSection from './ReportSection';
import NumberCard from './NumberCard';
import LoshuGrid from './LoshuGrid';
import MarkdownRenderer from './common/MarkdownRenderer';
import BrandAnalyzer from './brand/BrandAnalyzer';
import ChatWidget from './chat/ChatWidget';
import YearlyForecast from './forecast/YearlyForecast';
import { calculateMulank } from '../services/numerologyService';
import UnlockReportCTA from './common/UnlockReportCTA';

interface DashboardProps {
  report: WorldClassReport;
  userData: UserData;
  onReset: () => void;
  isUnlocked: boolean;
  isUnlocking: boolean;
  onUnlock: () => void;
}

// Icon Components
const Icons: { [key: string]: React.ReactNode } = {
    CosmicIdentity: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    LoshuGrid: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Wealth: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2.01V5M12 20v-1m0 1v.01M12 18v-1m0-1v-1m0-1v-1m0-1V9m0-1V8m0-1V7m0-1V6m0-1V5m0-1V4" /></svg>,
    Health: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    Relationships: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3M15 21a4 4 0 00-4-4h-4a4 4 0 00-4 4" /></svg>,
    Psychology: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>,
    Navigator: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Spiritual: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c1.14 0 2.233-.234 3.224-.674M12 21A9 9 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9c0 .356-.02.71-.058 1.05M3.464 15.036A9.004 9.004 0 0112 3c1.603 0 3.11.416 4.41 1.126M12 3c-1.14 0-2.233.234-3.224.674m6.448 0A9.004 9.004 0 0012 3z" /></svg>,
    Intellect: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    Forecast: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    About: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const pillarStyles: { [key: string]: string } = {
    cosmicIdentity: 'pillar-cosmic-identity',
    loshuAnalysis: 'pillar-loshu',
    wealthBusinessCareer: 'pillar-wealth',
    default: 'pillar-default',
};

const pillarData = [
    { key: 'wealthBusinessCareer', title: 'Wealth, Business & Career', icon: Icons.Wealth, tooltip: "Analyzes financial destiny and career paths. e.g., A strong '8' suggests leadership in business, while a '6' points towards creative or healing professions." },
    { key: 'healthEnergyWellness', title: 'Health, Energy & Wellness', icon: Icons.Health, tooltip: "Connects numbers to well-being. e.g., Number '9' can indicate high energy but also a susceptibility to stress, suggesting practices like meditation." },
    { key: 'relationshipsFamilyLegacy', title: 'Relationships, Family & Legacy', icon: Icons.Relationships, tooltip: "Explores compatibility and karmic lessons. e.g., Life Path '2' is highly compatible with '6', and we can forecast auspicious periods for marriage." },
    { key: 'psychologyShadowWork', title: 'Psychology & Shadow Work', icon: Icons.Psychology, tooltip: "Identifies subconscious patterns and challenges. e.g., A prominent '4' might indicate a fear of instability, a key area for personal growth." },
    { key: 'dailyNavigator', title: 'Daily Navigator & Timing', icon: Icons.Navigator, tooltip: "A tactical guide for daily alignment. e.g., On a day ruled by '1', wearing red can boost confidence for an important meeting." },
    { key: 'spiritualAlignment', title: 'Spiritual Alignment & Remedies', icon: Icons.Spiritual, tooltip: "Personalized spiritual tools to manifest goals. e.g., For a Life Path '7', Amethyst can enhance intuition, and specific mantras deepen connection." },
    { key: 'intellectEducation', title: 'Intellect, Education & Knowledge', icon: Icons.Intellect, tooltip: "Uncovers your unique learning style. e.g., A dominant '5' suggests excelling in dynamic fields like communication or marketing." },
];

const Dashboard: React.FC<DashboardProps> = ({ report, userData, onReset, isUnlocked, isUnlocking, onUnlock }) => {
  const { cosmicIdentity, loshuAnalysis, futureForecast } = report;
  const mulank = calculateMulank(userData.dob);
  const lifePathNumber = cosmicIdentity.coreNumbers.lifePath.number;

  const renderPillarContent = (pillarKey: keyof WorldClassReport) => {
    const pillar = (report as any)[pillarKey];
    if (!pillar) return null;
    const content = pillar.content || pillar; // Handle nested structures
    const teaser = pillar.teaser;
    return <MarkdownRenderer content={isUnlocked ? content : teaser} />;
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-starlight font-display">Your Soul Map</h2>
          <p className="text-lunar-grey mt-2">Prepared for <span className="text-cosmic-gold font-semibold">{userData.fullName}</span></p>
        </div>

        {!isUnlocked && <UnlockReportCTA onUnlock={onUnlock} isLoading={isUnlocking} />}

        <ReportSection 
          title="Section 1: Cosmic Identity" 
          icon={Icons.CosmicIdentity}
          className={`${pillarStyles.cosmicIdentity} animate-pillar-reveal report-section`}
          style={{ animationDelay: '0ms' }}
          tooltipText="Decodes your energetic signature. e.g., Your Life Path number reveals your life's main journey, while your Expression number shows your innate talents."
        >
          <div className="space-y-6">
              {Object.entries(cosmicIdentity.coreNumbers).map(([key, value]) => (
                  <React.Fragment key={key}>
                      <NumberCard 
                        title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                        data={value} 
                      />
                      {key !== 'maturity' && <hr className="border-lunar-grey/10" />}
                  </React.Fragment>
              ))}
          </div>
          <div className="mt-6 space-y-4">
              <div>
                  <h4 className="text-xl font-bold text-cosmic-gold font-display">Soul Synopsis</h4>
                  <MarkdownRenderer content={isUnlocked ? cosmicIdentity.soulSynopsis.content : cosmicIdentity.soulSynopsis.teaser} />
              </div>
              <div>
                  <h4 className="text-xl font-bold text-cosmic-gold font-display">Famous Parallel Souls</h4>
                  <MarkdownRenderer content={isUnlocked ? cosmicIdentity.famousParallels.content : cosmicIdentity.famousParallels.teaser} />
              </div>
              <div>
                  <h4 className="text-xl font-bold text-cosmic-gold font-display">Planetary Rulerships</h4>
                  <MarkdownRenderer content={isUnlocked ? cosmicIdentity.planetaryRulerships.content : cosmicIdentity.planetaryRulerships.teaser} />
              </div>
          </div>
        </ReportSection>

        <ReportSection 
          title="Section 2: Loshu Grid" 
          icon={Icons.LoshuGrid}
          className={`${pillarStyles.loshuAnalysis} animate-pillar-reveal report-section`}
          style={{ animationDelay: '100ms' }}
          tooltipText="A mystical grid from your birth date revealing strengths and weaknesses. e.g., Missing numbers indicate areas for growth, like a missing '5' suggesting a need for more adaptability."
        >
          <LoshuGrid 
            grid={loshuAnalysis.grid} 
            missingNumbers={loshuAnalysis.missingNumbers}
            overloadedNumbers={loshuAnalysis.overloadedNumbers}
            userData={userData} 
            birthNumber={mulank} 
            destinyNumber={lifePathNumber}
            elementalPlanes={loshuAnalysis.elementalPlanes}
            isUnlocked={isUnlocked}
          />
        </ReportSection>

        {pillarData.map((pillar, index) => (
          <ReportSection 
              key={pillar.key} 
              title={`Section ${index + 3}: ${pillar.title}`} 
              icon={pillar.icon}
              className={`${pillarStyles.default} animate-pillar-reveal report-section`}
              style={{ animationDelay: `${200 + index * 100}ms` }}
              tooltipText={pillar.tooltip}
          >
             {renderPillarContent(pillar.key as keyof WorldClassReport)}
             {pillar.key === 'wealthBusinessCareer' && isUnlocked && (
                <>
                 <hr className="border-lunar-grey/10 my-6" />
                 <BrandAnalyzer userData={userData} report={report} />
                </>
             )}
          </ReportSection>
        ))}

          <ReportSection 
              title={`Section ${3 + pillarData.length}: Future Forecast`} 
              icon={Icons.Forecast}
              className={`${pillarStyles.default} animate-pillar-reveal report-section`}
              style={{ animationDelay: `${200 + pillarData.length * 100}ms` }}
              tooltipText="Projects your energetic cycles into the future. e.g., Your Personal Year number for 2026 might be '3', indicating a year of creativity and social expansion."
          >
              <div className="space-y-6">
                  <NumberCard 
                    title="Personal Year Number" 
                    data={futureForecast.personalYear} 
                  />
                  <hr className="border-lunar-grey/10" />
                  <div>
                      <h4 className="text-xl font-bold text-cosmic-gold font-display">12-Month Strategic Roadmap</h4>
                      <MarkdownRenderer content={isUnlocked ? futureForecast.strategicRoadmap.content : futureForecast.strategicRoadmap.teaser} />
                  </div>
                  {isUnlocked && (
                    <>
                      <hr className="border-lunar-grey/10 my-6" />
                      <YearlyForecast userData={userData} />
                    </>
                  )}
              </div>
        </ReportSection>

        <ReportSection
            title={`Section ${3 + pillarData.length + 1}: About Vidhira`}
            icon={Icons.About}
            className={`${pillarStyles.default} animate-pillar-reveal report-section`}
            style={{ animationDelay: `${200 + (pillarData.length + 1) * 100}ms` }}
            tooltipText="Learn more about the philosophy and technology behind the Vidhira system."
        >
            <MarkdownRenderer content={`**Vidhira: Your AI Destiny Intelligence System**

Vidhira is a next-generation numerology platform that fuses the ancient, time-tested wisdom of Chaldean Numerology with the power of advanced Artificial Intelligence. Our mission is to provide you with a 'spiritual operating manual'—a dynamic, interactive life dashboard that decodes the complex vibrational patterns of your life into clear, actionable intelligence.

Powered by Google's Gemini AI models, Vidhira goes beyond static reports. It offers a deeply personalized experience, analyzing your core numbers to provide profound insights into your personality, purpose, and potential. Whether you're an entrepreneur seeking strategic alignment, a professional navigating your career path, or a seeker on a journey of self-discovery, Vidhira is designed to be your trusted companion for making conscious, soul-aligned decisions.`} />
        </ReportSection>

        <div className="text-center pt-4 flex justify-center items-center gap-4 no-print">
          <button
            onClick={onReset}
            className="border border-cosmic-gold text-cosmic-gold font-bold py-2 px-6 rounded-lg hover:bg-cosmic-gold hover:text-deep-void transform hover:scale-105 transition-all duration-300 hover:shadow-[0_0_15px_var(--lucky-color-glow)]"
          >
            Analyze Another Profile
          </button>
          {isUnlocked && (
             <button
                onClick={() => window.print()}
                className="bg-cosmic-gold text-deep-void font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cosmic-gold/20 hover:shadow-[0_0_15px_var(--lucky-color-glow)]"
              >
                Download PDF
              </button>
          )}
        </div>
      </div>
      <ChatWidget report={report} userData={userData} />
    </>
  );
};

export default Dashboard;
