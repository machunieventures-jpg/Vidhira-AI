
import React, { useRef, useState, useEffect } from 'react';
import type { WorldClassReport, UserData, CompatibilityPairing } from '../types';
import ReportSection from './ReportSection';
import NumberCard from './NumberCard';
import LoshuGrid from './LoshuGrid';
import MarkdownRenderer from './common/MarkdownRenderer';
import BrandAnalyzer from './brand/BrandAnalyzer';
import ChatWidget from './chat/ChatWidget';
import YearlyForecast from './forecast/YearlyForecast';
import { calculateMulank } from '../services/numerologyService';
import UnlockReportCTA from './common/UnlockReportCTA';
import JyotishFeature from './jyotish/JyotishFeature';

// AnimateOnScroll Wrapper Component
const AnimateOnScroll: React.FC<{children: React.ReactNode, delay?: number, className?: string}> = ({ children, delay = 0, className = '' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`${className} animate-scroll-reveal ${isVisible ? 'visible' : ''}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};


interface DashboardProps {
  report: WorldClassReport;
  userData: UserData;
  onReset: () => void;
  onEdit: () => void;
  isUnlocked: boolean;
  isUnlocking: boolean;
  onUnlock: () => void;
}

// Icon Components
const Icons: { [key: string]: React.ReactNode } = {
    Kundali: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
    Jyotish: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-1.954 0-3.832.78-5.223 2.172a7.387 7.387 0 000 10.456C7.94 16.999 9.87 17.5 12 17.5s4.06-.501 5.373-1.872a7.387 7.387 0 000-10.456C15.832 3.78 13.954 3 12 3zm0 1.5c1.61 0 3.125.624 4.243 1.742a5.887 5.887 0 010 8.316C15.125 15.876 13.61 16 12 16s-3.125-.124-4.243-1.242a5.887 5.887 0 010-8.316C8.875 5.124 10.39 4.5 12 4.5zM12 7.5L6.75 9l5.25 1.5L17.25 9 12 7.5zm0 9l-5.25-1.5L12 13.5l5.25-1.5-5.25 3z" /></svg>,
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
    kundaliSnapshot: 'pillar-kundali',
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

const CompatibilityList: React.FC<{ title: string; pairings: CompatibilityPairing[] }> = ({ title, pairings }) => (
    <div>
        <h5 className="text-lg font-bold text-starlight font-display mb-3">{title}</h5>
        <div className="space-y-3">
            {pairings.map(p => (
                <div key={p.compatibleNumber} className="flex items-start gap-4 p-3 bg-deep-void/20 rounded-lg">
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-cosmic-gold/10 border border-cosmic-gold/50 rounded-full text-cosmic-gold font-bold text-xl">
                        {p.compatibleNumber}
                    </div>
                    <p className="text-lunar-grey text-sm">{p.interpretation}</p>
                </div>
            ))}
        </div>
    </div>
);

const KundaliSignCard: React.FC<{ title: string, sign: string, icon: React.ReactNode }> = ({ title, sign, icon }) => (
    <div className="flex-1 p-4 rounded-xl bg-void-tint/50 border border-lunar-grey/20 text-center">
        <div className="w-10 h-10 mx-auto mb-2 text-cosmic-gold">{icon}</div>
        <h5 className="text-sm font-semibold text-lunar-grey">{title}</h5>
        <p className="text-lg font-bold text-starlight font-display">{sign}</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ report, userData, onReset, onEdit, isUnlocked, isUnlocking, onUnlock }) => {
  const { kundaliSnapshot, cosmicIdentity, loshuAnalysis, futureForecast, relationshipsFamilyLegacy, spiritualAlignment } = report;
  const mulank = calculateMulank(userData.dob);
  const lifePathNumber = cosmicIdentity.coreNumbers.lifePath.number;

  const renderPillarContent = (pillarKey: keyof Omit<WorldClassReport, 'relationshipsFamilyLegacy'>) => {
    const pillar = (report as any)[pillarKey];
    if (!pillar) return null;
    const content = pillar.content || pillar;
    const teaser = pillar.teaser;
    return <MarkdownRenderer content={isUnlocked ? content : teaser} />;
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        <AnimateOnScroll>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-starlight font-display">Your Soul Map</h2>
            <p className="text-lunar-grey mt-2">Prepared for <span className="text-cosmic-gold font-semibold">{userData.fullName}</span></p>
          </div>
        </AnimateOnScroll>

        {!isUnlocked && 
            <AnimateOnScroll delay={100}>
                <UnlockReportCTA onUnlock={onUnlock} isLoading={isUnlocking} />
            </AnimateOnScroll>
        }

        <AnimateOnScroll delay={200}>
            <ReportSection 
              title="Section 1: Vedic Kundali Snapshot" 
              icon={Icons.Kundali}
              className={`${pillarStyles.kundaliSnapshot} report-section`}
              tooltipText="A high-level summary of your Vedic astrological chart based on your birth time and location. This reveals your core personality drivers."
            >
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <KundaliSignCard title="Ascendant (Lagna)" sign={kundaliSnapshot.ascendant} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                  <KundaliSignCard title="Moon Sign (Rashi)" sign={kundaliSnapshot.moonSign} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>} />
                  <KundaliSignCard title="Sun Sign" sign={kundaliSnapshot.sunSign} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
              </div>
               <MarkdownRenderer content={kundaliSnapshot.summary} />
            </ReportSection>
        </AnimateOnScroll>
        
        <AnimateOnScroll delay={300}>
            <ReportSection 
              title="Section 2: Vedic Astrology Deep Dive (Jyotish)"
              icon={Icons.Jyotish}
              className={`${pillarStyles.default} report-section`}
              tooltipText="A comprehensive Vedic astrology analysis covering planetary positions, yogas (special combinations), doshas (challenges), and timing of life events (Dasha system)."
            >
              {isUnlocked ? (
                <JyotishFeature userData={userData} />
              ) : (
                <div className="text-center text-lunar-grey p-4">
                    <p>Unlock the full report to access your detailed Traditional Jyotish analysis.</p>
                </div>
              )}
            </ReportSection>
        </AnimateOnScroll>

        <AnimateOnScroll delay={400}>
            <ReportSection 
              title="Section 3: Cosmic Identity (Numerology)" 
              icon={Icons.CosmicIdentity}
              className={`${pillarStyles.cosmicIdentity} report-section`}
              tooltipText="Decodes your energetic signature. e.g., Your Life Path number reveals your life's main journey, while your Expression number shows your innate talents."
            >
              <div className="space-y-6">
                  {Object.entries(cosmicIdentity.coreNumbers).map(([key, value], index) => (
                      <AnimateOnScroll key={key} delay={index * 100}>
                          <div>
                            <NumberCard 
                              title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                              data={value} 
                            />
                            {key !== 'maturity' && <hr className="border-lunar-grey/10 mt-6" />}
                          </div>
                      </AnimateOnScroll>
                  ))}
              </div>
              <div className="mt-6 space-y-4">
                  <AnimateOnScroll>
                      <div>
                          <h4 className="text-xl font-bold text-cosmic-gold font-display">Your Soul's Essence</h4>
                          <MarkdownRenderer content={isUnlocked ? cosmicIdentity.soulSynopsis.content : cosmicIdentity.soulSynopsis.teaser} />
                      </div>
                  </AnimateOnScroll>
                  <AnimateOnScroll delay={100}>
                      <div>
                          <h4 className="text-xl font-bold text-cosmic-gold font-display">Echoes of Greatness: Famous Parallels</h4>
                          <MarkdownRenderer content={isUnlocked ? cosmicIdentity.famousParallels.content : cosmicIdentity.famousParallels.teaser} />
                      </div>
                  </AnimateOnScroll>
                   <AnimateOnScroll delay={200}>
                      <div>
                          <h4 className="text-xl font-bold text-cosmic-gold font-display">Planetary Rulerships</h4>
                          <MarkdownRenderer content={isUnlocked ? cosmicIdentity.planetaryRulerships.content : cosmicIdentity.planetaryRulerships.teaser} />
                      </div>
                  </AnimateOnScroll>
              </div>
            </ReportSection>
        </AnimateOnScroll>

        <AnimateOnScroll delay={500}>
            <ReportSection 
              title="Section 4: Loshu Grid" 
              icon={Icons.LoshuGrid}
              className={`${pillarStyles.loshuAnalysis} report-section`}
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
        </AnimateOnScroll>

        {pillarData.map((pillar, index) => (
          <AnimateOnScroll key={pillar.key} delay={600 + index * 100}>
              <ReportSection 
                  title={`Section ${index + 5}: ${pillar.title}`} 
                  icon={pillar.icon}
                  className={`${pillarStyles.default} report-section`}
                  tooltipText={pillar.tooltip}
              >
                 { pillar.key === 'relationshipsFamilyLegacy' 
                   ? <MarkdownRenderer content={isUnlocked ? relationshipsFamilyLegacy.content : relationshipsFamilyLegacy.teaser} />
                   : renderPillarContent(pillar.key as keyof Omit<WorldClassReport, 'relationshipsFamilyLegacy'>)
                 }
                 {pillar.key === 'wealthBusinessCareer' && isUnlocked && (
                    <AnimateOnScroll>
                     <>
                     <hr className="border-lunar-grey/10 my-6" />
                     <BrandAnalyzer userData={userData} report={report} />
                    </>
                    </AnimateOnScroll>
                 )}
                 {pillar.key === 'relationshipsFamilyLegacy' && isUnlocked && relationshipsFamilyLegacy.compatibilityAnalysis && (
                    <AnimateOnScroll>
                        <>
                            <hr className="border-lunar-grey/10 my-8" />
                            <h4 className="text-xl font-bold text-cosmic-gold font-display mb-4">Core Number Compatibility</h4>
                            <div className="space-y-6">
                                <CompatibilityList title={`Life Path ${cosmicIdentity.coreNumbers.lifePath.number} Compatibility`} pairings={relationshipsFamilyLegacy.compatibilityAnalysis.lifePath} />
                                <CompatibilityList title={`Expression ${cosmicIdentity.coreNumbers.expression.number} Compatibility`} pairings={relationshipsFamilyLegacy.compatibilityAnalysis.expression} />
                                <CompatibilityList title={`Soul Urge ${cosmicIdentity.coreNumbers.soulUrge.number} Compatibility`} pairings={relationshipsFamilyLegacy.compatibilityAnalysis.soulUrge} />
                            </div>
                        </>
                    </AnimateOnScroll>
                 )}
                  {pillar.key === 'spiritualAlignment' && isUnlocked && spiritualAlignment.mantrasAndAffirmations?.length > 0 && (
                    <AnimateOnScroll>
                    <>
                      <hr className="border-lunar-grey/10 my-8" />
                      <h4 className="text-xl font-bold text-cosmic-gold font-display mb-4">Personalized Mantras & Affirmations</h4>
                      <div className="space-y-4">
                        {spiritualAlignment.mantrasAndAffirmations.map((mantra, i) => (
                          <blockquote key={i} className="border-l-4 border-cosmic-gold pl-4 py-2 bg-deep-void/20">
                            <p className="text-lg italic text-starlight">"{mantra}"</p>
                          </blockquote>
                        ))}
                      </div>
                    </>
                    </AnimateOnScroll>
                  )}
              </ReportSection>
          </AnimateOnScroll>
        ))}
          
          <AnimateOnScroll delay={600 + pillarData.length * 100}>
              <ReportSection 
                  title={`Section ${5 + pillarData.length}: Future Forecast`} 
                  icon={Icons.Forecast}
                  className={`${pillarStyles.default} report-section`}
                  tooltipText="Projects your energetic cycles into the future. e.g., Your Personal Year number for 2026 might be '3', indicating a year of creativity and social expansion."
              >
                  <div className="space-y-6">
                      <AnimateOnScroll delay={150}>
                          <NumberCard 
                            title="Personal Year Number" 
                            data={futureForecast.personalYear}
                          />
                      </AnimateOnScroll>
                      <hr className="border-lunar-grey/10" />
                      <AnimateOnScroll>
                          <div>
                              <h4 className="text-xl font-bold text-cosmic-gold font-display">12-Month Strategic Roadmap</h4>
                              <MarkdownRenderer content={isUnlocked ? futureForecast.strategicRoadmap.content : futureForecast.strategicRoadmap.teaser} />
                          </div>
                      </AnimateOnScroll>
                      {isUnlocked && (
                        <AnimateOnScroll>
                          <>
                            <hr className="border-lunar-grey/10 my-6" />
                            <YearlyForecast userData={userData} />
                          </>
                        </AnimateOnScroll>
                      )}
                  </div>
            </ReportSection>
        </AnimateOnScroll>

        <AnimateOnScroll delay={600 + (pillarData.length + 1) * 100}>
            <ReportSection
                title={`Section ${5 + pillarData.length + 1}: About Vidhira`}
                icon={Icons.About}
                className={`${pillarStyles.default} report-section`}
                tooltipText="Learn more about the philosophy and technology behind the Vidhira system."
            >
                <MarkdownRenderer content={`**Vidhira: Your AI Destiny Intelligence System**

Vidhira is a next-generation numerology platform that fuses the ancient, time-tested wisdom of Chaldean Numerology with the power of advanced Artificial Intelligence. Our mission is to provide you with a 'spiritual operating manual'—a dynamic, interactive life dashboard that decodes the complex vibrational patterns of your life into clear, actionable intelligence.

Powered by Google's Gemini AI models, Vidhira goes beyond static reports. It offers a deeply personalized experience, analyzing your core numbers to provide profound insights into your personality, purpose, and potential. Whether you're an entrepreneur seeking strategic alignment, a professional navigating your career path, or a seeker on a journey of self-discovery, Vidhira is designed to be your trusted companion for making conscious, soul-aligned decisions.`} />
            </ReportSection>
        </AnimateOnScroll>
        
        <AnimateOnScroll delay={200}>
            <div className="text-center pt-4 flex flex-wrap justify-center items-center gap-4 no-print">
              <button
                onClick={onEdit}
                className="border border-lunar-grey/50 text-lunar-grey font-bold py-2 px-6 rounded-lg hover:bg-lunar-grey/20 hover:text-starlight transform hover:scale-105 transition-all duration-300"
              >
                Edit Profile
              </button>
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
        </AnimateOnScroll>
      </div>
      <ChatWidget report={report} userData={userData} />
    </>
  );
};

export default Dashboard;
