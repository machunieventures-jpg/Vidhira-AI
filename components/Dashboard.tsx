import React from 'react';
import type { WorldClassReport, UserData } from '../types';
import ReportSection from './ReportSection';
import NumberCard from './NumberCard';
import LoshuGrid from './LoshuGrid';
import MarkdownRenderer from './common/MarkdownRenderer';
import BrandAnalyzer from './brand/BrandAnalyzer';
import ChatWidget from './chat/ChatWidget';
import YearlyForecast from './forecast/YearlyForecast';

interface DashboardProps {
  report: WorldClassReport;
  userData: UserData;
  onReset: () => void;
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
};

const pillarStyles: { [key: string]: string } = {
    cosmicIdentity: 'pillar-cosmic-identity',
    loshuAnalysis: 'pillar-loshu',
    wealthBusinessCareer: 'pillar-wealth',
    healthEnergyWellness: 'pillar-health',
    relationshipsFamilyLegacy: 'pillar-relationships',
    psychologyShadowWork: 'pillar-psychology',
    dailyNavigator: 'pillar-navigator',
    spiritualAlignment: 'pillar-spiritual',
    intellectEducation: 'pillar-intellect',
    futureForecast: 'pillar-forecast',
};

const otherPillars = [
    { key: 'healthEnergyWellness', title: 'Health, Energy & Wellness', icon: Icons.Health },
    { key: 'relationshipsFamilyLegacy', title: 'Relationships, Family & Legacy', icon: Icons.Relationships },
    { key: 'psychologyShadowWork', title: 'Psychology & Shadow Work', icon: Icons.Psychology },
    { key: 'dailyNavigator', title: 'Daily Navigator & Timing', icon: Icons.Navigator },
    { key: 'spiritualAlignment', title: 'Spiritual Alignment & Remedies', icon: Icons.Spiritual },
    { key: 'intellectEducation', title: 'Intellect, Education & Knowledge', icon: Icons.Intellect },
];


const Dashboard: React.FC<DashboardProps> = ({ report, userData, onReset }) => {
  const { cosmicIdentity, loshuAnalysis, futureForecast, wealthBusinessCareer } = report;

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-white font-display">Your Full Life Report Blueprint</h2>
          <p className="text-cool-cyan mt-2">Prepared for <span className="text-aurora-pink font-semibold">{userData.fullName}</span></p>
        </div>

        <ReportSection 
          title="Pillar 1: Cosmic Identity" 
          icon={Icons.CosmicIdentity}
          className={`${pillarStyles.cosmicIdentity} animate-slide-up-fade`}
          style={{ animationDelay: '0ms' }}
        >
          <div className="space-y-8">
              {Object.entries(cosmicIdentity.coreNumbers).map(([key, value]) => (
                  <React.Fragment key={key}>
                      <NumberCard title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} data={value} />
                      {key !== 'maturity' && <hr className="border-white/10" />}
                  </React.Fragment>
              ))}
          </div>
          <div className="mt-6 space-y-4">
              <div>
                  <h4 className="text-xl font-bold text-cool-cyan font-display">Soul Synopsis</h4>
                  <p className="text-white/80 mt-1 whitespace-pre-wrap">{cosmicIdentity.soulSynopsis}</p>
              </div>
              <div>
                  <h4 className="text-xl font-bold text-cool-cyan font-display">Famous Parallel Souls</h4>
                  <MarkdownRenderer content={cosmicIdentity.famousParallels} />
              </div>
              <div>
                  <h4 className="text-xl font-bold text-cool-cyan font-display">Planetary Rulerships</h4>
                  <MarkdownRenderer content={cosmicIdentity.planetaryRulerships} />
              </div>
          </div>
        </ReportSection>

        <ReportSection 
          title="Pillar 2: Loshu Grid & Numeric Matrix" 
          icon={Icons.LoshuGrid}
          className={`${pillarStyles.loshuAnalysis} animate-slide-up-fade`}
          style={{ animationDelay: '150ms' }}
        >
          <LoshuGrid grid={loshuAnalysis.grid} missingNumbers={loshuAnalysis.missingNumbers} userData={userData} />
          <div className="mt-6 space-y-4 text-white/90">
              <MarkdownRenderer content={`**Overloaded Numbers:** ${loshuAnalysis.overloadedNumbers.join(', ') || 'None'}`} />
              <h4 className="text-xl font-bold text-cool-cyan font-display mt-4">Elemental Planes Analysis</h4>
              <MarkdownRenderer content={loshuAnalysis.elementalPlanes.mental} />
              <MarkdownRenderer content={loshuAnalysis.elementalPlanes.emotional} />
              <MarkdownRenderer content={loshuAnalysis.elementalPlanes.practical} />
              <h4 className="text-xl font-bold text-cool-cyan font-display mt-4">Balance Summary</h4>
              <MarkdownRenderer content={loshuAnalysis.balanceSummary} />
              <h4 className="text-xl font-bold text-cool-cyan font-display mt-4">Missing Number Compensation Strategy</h4>
              <MarkdownRenderer content={loshuAnalysis.compensationStrategy} />
          </div>
        </ReportSection>

        <ReportSection 
          title="Pillar 3: Wealth, Business & Career" 
          icon={Icons.Wealth}
          className={`${pillarStyles.wealthBusinessCareer} animate-slide-up-fade`}
          style={{ animationDelay: '300ms' }}
        >
          <MarkdownRenderer content={wealthBusinessCareer} />
          <hr className="border-white/10 my-6" />
          <BrandAnalyzer userData={userData} report={report} />
        </ReportSection>


        {otherPillars.map((pillar, index) => (
          <ReportSection 
              key={pillar.key} 
              title={`Pillar ${index + 4}: ${pillar.title}`} 
              icon={pillar.icon}
              className={`${pillarStyles[pillar.key]} animate-slide-up-fade`}
              style={{ animationDelay: `${450 + index * 150}ms` }}
          >
              <MarkdownRenderer content={(report as any)[pillar.key]} />
          </ReportSection>
        ))}

          <ReportSection 
              title="Pillar 10: Advanced Future Forecast" 
              icon={Icons.Forecast}
              className={`${pillarStyles.futureForecast} animate-slide-up-fade`}
              style={{ animationDelay: `${450 + otherPillars.length * 150}ms` }}
          >
              <div className="space-y-6">
                  <NumberCard title="Personal Year Number" data={futureForecast.personalYear} />
                  <hr className="border-white/10" />
                  <div>
                      <h4 className="text-xl font-bold text-cool-cyan font-display">12-Month Strategic Roadmap</h4>
                      <MarkdownRenderer content={futureForecast.strategicRoadmap} />
                  </div>
                  <hr className="border-white/10 my-6" />
                  <YearlyForecast userData={userData} />
              </div>
        </ReportSection>

        <div className="text-center pt-4">
          <button
            onClick={onReset}
            className="bg-cool-cyan/80 text-deep-purple font-bold py-2 px-6 rounded-lg hover:bg-cool-cyan transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cool-cyan/20"
          >
            Analyze Another Profile
          </button>
        </div>
      </div>
      <ChatWidget report={report} userData={userData} />
    </>
  );
};

export default Dashboard;