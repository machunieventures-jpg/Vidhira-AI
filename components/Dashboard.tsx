
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
import { exportReportAsPDF } from '../services/pdfService';

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
    Kundali: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3zM3 3l18 18M3 21L21 3" /></svg>,
    Jyotish: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-3.5-8.5a.5.5 0 100-1 .5.5 0 000 1zm5-2a.5.5 0 100-1 .5.5 0 000 1zm-7 4a.5.5 0 100-1 .5.5 0 000 1zm11-1a.5.5 0 100-1 .5.5 0 000 1z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" /></svg>,
    CosmicIdentity: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 009-9h-2a7 7 0 01-7 7v2zm-2.12-2.12A9 9 0 0019 5.12V3a7 7 0 01-7 7h2zm-5.76 0A9 9 0 003 5.12V3a7 7 0 017 7h-2zm-2.12-5.76A9 9 0 005 19h2a7 7 0 01-7-7v-2zM12 12a3 3 0 100-6 3 3 0 000 6z" /></svg>,
    LoshuGrid: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    Wealth: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-3.33 0-5 1.67-5 2.5s1.67 2.5 5 2.5 5-1.67 5-2.5-1.67-2.5-5-2.5zM12 13c-3.33 0-5 1.67-5 2.5S8.67 18 12 18s5-1.67 5-2.5-1.67-2.5-5-2.5zM12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>,
    Health: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.99 6.99 0 0116.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>,
    Relationships: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
    Psychology: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" opacity=".4"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm6 0c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zM6 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" /></svg>,
    Navigator: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Spiritual: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>,
    Intellect: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Forecast: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>,
    About: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await exportReportAsPDF(userData.fullName);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Sorry, there was an issue creating the PDF. Please try again or check the console for errors.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const renderPillarContent = (pillarKey: keyof Omit<WorldClassReport, 'relationshipsFamilyLegacy'>) => {
    const pillar = (report as any)[pillarKey];
    if (!pillar) return null;
    const content = pillar.content || pillar;
    const teaser = pillar.teaser;
    return <MarkdownRenderer content={isUnlocked ? content : teaser} />;
  }

  return (
    <>
      <div id="report-container" className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-8">
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
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="bg-cosmic-gold text-deep-void font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cosmic-gold/20 hover:shadow-[0_0_15px_var(--lucky-color-glow)] disabled:bg-lunar-grey disabled:opacity-75 disabled:cursor-wait disabled:scale-100"
                  >
                    {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
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