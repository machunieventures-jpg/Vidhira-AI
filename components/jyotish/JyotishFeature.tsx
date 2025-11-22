
import React, { useState } from 'react';
import { generateJyotishReport } from '../../services/geminiService';
import type { UserData, JyotishReportData, NakshatraInfo, LifeCyclePhase, KeyLifeEvent, ActionableGuidance, DetailedRemedy } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';
import { trackEvent } from '../../services/analyticsService';
import PlanetaryChart from './PlanetaryChart';
import RasiChart from './RasiChart';
import GrahaBalaChart from './GrahaBalaChart';

interface JyotishFeatureProps {
    userData: UserData;
}

const NakshatraCard: React.FC<{ title: string, info: NakshatraInfo }> = ({ title, info }) => (
    <div className="bg-white/50 dark:bg-[--deep-space]/50 p-4 rounded-xl border border-purple-100 dark:border-purple-800 shadow-sm">
        <h5 className="text-sm font-bold text-[--cosmic-purple] dark:text-[--gold-accent] uppercase tracking-wider mb-2">{title}</h5>
        <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{info.name}</div>
            <div className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-700 dark:text-purple-200">Lord: {info.lord}</div>
            {info.quality && <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400">{info.quality}</div>}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{info.summary}</p>
    </div>
);

const SoulPurposeCard: React.FC<{ data: JyotishReportData['soulPurpose'] }> = ({ data }) => (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-2xl shadow-xl border border-white/10 relative overflow-hidden">
        {/* Abstract BG shape */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        
        <h4 className="text-xl font-bold text-[--gold-accent] mb-4 flex items-center gap-2">
            <span className="text-2xl">☸️</span> The Reason You Were Born
        </h4>

        <div className="space-y-6 relative z-10">
            <div>
                <h5 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-1">Your Soul Planet (Atmakaraka)</h5>
                <p className="text-lg font-medium text-white"><span className="font-bold text-cyan-300">{data.atmakaraka.planet}</span> — {data.atmakaraka.significance}</p>
            </div>

             <div className="pt-4 border-t border-white/10">
                <h5 className="text-sm font-semibold text-[--gold-accent] uppercase tracking-wider mb-1">Your Dharma (Divine Duty)</h5>
                <p className="text-white leading-relaxed">{data.dharma}</p>
            </div>
        </div>
    </div>
);

const KarmicMemoryCard: React.FC<{ data: JyotishReportData['soulPurpose'] }> = ({ data }) => (
     <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 p-6 rounded-2xl">
        <h4 className="text-xl font-bold gradient-text mb-4 flex items-center gap-2">
             <span className="text-2xl">📜</span> Karmic Playback & Past Life
        </h4>
        
        <div className="space-y-6">
             {/* Atmakaraka Wounds */}
            <div>
                <h5 className="font-bold text-gray-700 dark:text-gray-200 mb-1">Past Life Wounds (Atmakaraka)</h5>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{data.atmakaraka.pastLifeWounds}</p>
            </div>

            {/* Rahu/Ketu Axis */}
             <div>
                <h5 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Rahu & Ketu Axis</h5>
                <div className="flex flex-col sm:flex-row gap-4 text-sm mb-2">
                    <div className="flex-1 bg-black/5 dark:bg-black/20 p-3 rounded-lg">
                        <span className="text-red-500 dark:text-red-300 font-bold block mb-1">Rahu (Obsession):</span> {data.karmicAxis.rahuPlacement}
                    </div>
                    <div className="flex-1 bg-black/5 dark:bg-black/20 p-3 rounded-lg">
                        <span className="text-gray-500 dark:text-gray-400 font-bold block mb-1">Ketu (Past Mastery):</span> {data.karmicAxis.ketuPlacement}
                    </div>
                </div>
                 <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{data.karmicAxis.repeatingPatterns}"</p>
            </div>
            
            {/* D60 & Childhood */}
            <div className="grid sm:grid-cols-2 gap-6">
                 <div>
                     <h5 className="font-bold text-gray-700 dark:text-gray-200 mb-1 text-sm">D-60 Karmic Memory</h5>
                     <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">{data.d60Memory}</p>
                 </div>
                 <div>
                     <h5 className="font-bold text-gray-700 dark:text-gray-200 mb-1 text-sm">Childhood (0-12 Years)</h5>
                     <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">{data.childhoodAnalysis}</p>
                 </div>
            </div>
        </div>
     </div>
);

const DashaTimeline: React.FC<{ period: JyotishReportData['currentPeriod'] }> = ({ period }) => (
    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 p-5 rounded-xl">
        <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center text-xl">⏳</div>
             <div>
                 <h5 className="font-bold text-gray-800 dark:text-gray-100">Current Life Season (Vimshottari)</h5>
                 <p className="text-xs text-gray-500 dark:text-gray-400">The Most Important Active Timing</p>
             </div>
        </div>
        
        <div className="flex items-center gap-2 text-lg font-bold text-orange-700 dark:text-orange-300 mb-2">
            <span>{period.currentMahadasha}</span>
            <span className="text-gray-400">→</span>
            <span>{period.currentAntardasha}</span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{period.analysis}</p>
        {period.endDate && <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Cycle ends: {period.endDate}</div>}
    </div>
);

const FutureTimelineSection: React.FC<{ phases: LifeCyclePhase[] }> = ({ phases }) => (
    <div className="space-y-4">
        <h4 className="text-xl font-bold gradient-text mb-4">Future Life Timeline (Age-Wise)</h4>
        <div className="relative border-l-2 border-purple-200 dark:border-purple-800 ml-3 space-y-8 pl-6 py-2">
            {phases.map((phase, idx) => (
                <div key={idx} className="relative">
                    {/* Dot */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[--cosmic-purple] border-4 border-white dark:border-[--deep-space]"></div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <span className="text-sm font-bold px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-200 rounded-md">
                            {phase.ageRange}
                        </span>
                        <span className="font-bold text-gray-700 dark:text-gray-200">
                             {phase.cycleName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                            — {phase.theme}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{phase.prediction}</p>
                </div>
            ))}
        </div>
    </div>
);

const KeyEventsTable: React.FC<{ events: KeyLifeEvent[] }> = ({ events }) => (
    <div>
        <h4 className="text-xl font-bold gradient-text mb-4">Event Timing (Master System)</h4>
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
                <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                    <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Age / Year</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 rounded-tr-lg">Prediction</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((evt, i) => (
                        <tr key={i} className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent">
                            <td className="px-4 py-3 font-semibold">
                                Age {evt.age} <span className="text-gray-400 font-normal">({evt.year})</span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold
                                    ${evt.category === 'Career' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                      evt.category === 'Love' || evt.category === 'Relationship' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                                      evt.category === 'Wealth' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                    }`}>
                                    {evt.category}
                                </span>
                            </td>
                            <td className="px-4 py-3">{evt.eventDescription}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const GuidanceSection: React.FC<{ guidance: ActionableGuidance }> = ({ guidance }) => (
    <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-4 rounded-xl">
             <h5 className="font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                <span>✅</span> When To Act
             </h5>
             <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {guidance.bestActions.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                        <span>{item}</span>
                    </li>
                ))}
             </ul>
        </div>

        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 rounded-xl">
             <h5 className="font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                <span>🛑</span> What To Avoid
             </h5>
             <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {guidance.pitfalls.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                         <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                        <span>{item}</span>
                    </li>
                ))}
             </ul>
        </div>

         <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 p-4 rounded-xl">
             <h5 className="font-bold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                <span>🙏</span> General Remedies
             </h5>
             <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {guidance.remedies.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></span>
                        <span>{item}</span>
                    </li>
                ))}
             </ul>
        </div>
    </div>
);

const VedicRemediesSection: React.FC<{ remedies: DetailedRemedy[] }> = ({ remedies }) => {
    if (!remedies || remedies.length === 0) return null;

    return (
        <div>
            <h4 className="text-xl font-bold gradient-text mb-4 flex items-center gap-2">
                <span className="text-2xl">🕉️</span> Personalized Vedic Remedies (Upay)
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                These remedies are specifically curated for the most challenging planetary influences in your chart (weak or afflicted planets). Performing these can help balance karmic debts and clear energetic blockages.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
                {remedies.map((remedy, idx) => (
                    <div key={idx} className="glass-card !p-6 border-t-4 border-t-[--cosmic-purple] dark:border-t-[--gold-accent] relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full -mr-6 -mt-6 z-0 pointer-events-none"></div>
                         
                         <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="font-bold text-lg text-gray-800 dark:text-gray-100">{remedy.planet}</h5>
                                <span className="text-xs font-bold px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full uppercase">Remedy Required</span>
                            </div>
                            <p className="text-sm text-[--rose-accent] font-medium mb-4 italic">{remedy.reason}</p>
                            
                            <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0">📿</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Mantra</p>
                                        <p className="text-sm font-serif italic text-gray-800 dark:text-gray-200">"{remedy.mantra}"</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">💎</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Gemstone</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{remedy.gemstone?.name || "Consult Astrologer"}</p>
                                        {remedy.gemstone?.instruction && <p className="text-xs text-gray-500 dark:text-gray-400">{remedy.gemstone.instruction}</p>}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">🤝</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Charity & Action</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{remedy.charity}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Habit: {remedy.behavioralCorrection}</p>
                                    </div>
                                </div>
                            </div>
                         </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-lg text-xs text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <p><strong>Important:</strong> Gemstones affect your energy field significantly. Always consult a qualified professional before wearing one, especially for the 6th, 8th, or 12th house lords.</p>
            </div>
        </div>
    );
};

const JyotishFeature: React.FC<JyotishFeatureProps> = ({ userData }) => {
    const [report, setReport] = useState<JyotishReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setReport(null);

        try {
            const result = await generateJyotishReport(userData);
            setReport(result);
            trackEvent('JYOTISH_REPORT_GENERATED', { userName: userData.fullName });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate your Jyotish report. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <div className="loading-mandala"></div>
                    <p className="text-xl font-bold gradient-text">Calculating Vedic Positions (Lahiri)...</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm max-w-sm text-center">
                        Consulting the Ephemeris, determining Nakshatras, and analyzing your Dasha periods.
                    </p>
                </div>
            )}

            {error && (
                 <div className="text-center bg-[--rose-accent]/10 text-[--rose-accent] p-4 rounded-lg">
                    <p className="font-bold">Error</p>
                    <p className="mt-1 text-sm">{error}</p>
                    <button onClick={handleGenerate} className="mt-3 btn-cosmic !py-2 !px-4">
                        Try Again
                    </button>
                </div>
            )}
            
            {!isLoading && !report && !error && (
                 <div className="text-center p-4">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Go beyond numerology with a traditional Vedic Astrology (Jyotish) report. 
                        This deep dive includes your **Janma Nakshatra**, **Atmakaraka (Soul Purpose)**, and current **Dasha** period analysis based on authentic Parashara Light logic.
                    </p>
                    <button
                        onClick={handleGenerate}
                        className="btn-cosmic"
                    >
                        Reveal My Vedic Blueprint
                    </button>
                </div>
            )}

            {report && (
                <div className="mt-4 animate-slide-up space-y-8">
                     {/* Top Section: Charts & Soul Purpose */}
                     <div className="grid lg:grid-cols-2 gap-8">
                        <RasiChart placements={report.planetaryPlacements} ascendant={report.ascendantSign} />
                        <div className="space-y-6">
                             <SoulPurposeCard data={report.soulPurpose} />
                             {report.currentPeriod && <DashaTimeline period={report.currentPeriod} />}
                        </div>
                     </div>

                     <hr className="border-gray-200 dark:border-gray-700" />

                     {/* New Karmic Memory Section */}
                     <KarmicMemoryCard data={report.soulPurpose} />

                     <hr className="border-gray-200 dark:border-gray-700" />

                     {/* New Future Timeline */}
                     {report.futureTimeline && report.futureTimeline.length > 0 && (
                        <FutureTimelineSection phases={report.futureTimeline} />
                     )}
                     
                     <hr className="border-gray-200 dark:border-gray-700" />

                     {/* New Key Events Table */}
                     {report.keyEvents && report.keyEvents.length > 0 && (
                        <KeyEventsTable events={report.keyEvents} />
                     )}

                     <hr className="border-gray-200 dark:border-gray-700" />

                     {/* New Guidance Engine */}
                     {report.guidance && (
                        <>
                            <h4 className="text-xl font-bold gradient-text mb-4">Actionable Guidance Engine</h4>
                            <GuidanceSection guidance={report.guidance} />
                             <hr className="border-gray-200 dark:border-gray-700 mt-8" />
                        </>
                     )}

                     {/* New Detailed Remedies Section */}
                     {report.detailedRemedies && report.detailedRemedies.length > 0 && (
                        <>
                            <VedicRemediesSection remedies={report.detailedRemedies} />
                            <hr className="border-gray-200 dark:border-gray-700 mt-8" />
                        </>
                     )}

                     {/* Nakshatra Section */}
                     <div>
                        <h4 className="text-xl font-bold gradient-text mb-4">Nakshatra Profile (Lunar Mansions)</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                             <NakshatraCard title="Janma Nakshatra (Moon Star)" info={report.moonNakshatra} />
                             <NakshatraCard title="Ascendant Nakshatra (Lagna Star)" info={report.ascendantNakshatra} />
                        </div>
                     </div>

                     <hr className="border-gray-200 dark:border-gray-700" />
                     
                     {/* Planetary Strength */}
                     <GrahaBalaChart data={report.grahaBala} />
                     
                     <hr className="border-gray-200 dark:border-gray-700" />
                     
                     {/* Table View */}
                     <PlanetaryChart data={report.planetaryPlacements} />
                     
                     <hr className="border-gray-200 dark:border-gray-700" />
                     
                     {/* Text Report */}
                     <MarkdownRenderer content={report.markdownReport} />
                </div>
            )}
        </div>
    );
};

export default JyotishFeature;
