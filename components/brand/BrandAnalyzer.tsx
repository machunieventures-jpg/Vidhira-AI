import React, { useState } from 'react';
import { analyzeBrandName, analyzePhoneNumber, analyzeCompetitors } from '../../services/geminiService';
import type { UserData, WorldClassReport, BrandAnalysisV2, PhoneNumberAnalysis, CompetitorBrandAnalysis } from '../../types';
import { trackEvent } from '../../services/analyticsService';

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45; // 2 * pi * radius
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    let colorClass = 'text-[--sage-green]';
    if (score < 40) colorClass = 'text-[--rose-accent]';
    else if (score < 70) colorClass = 'text-[--gold-accent]';

    return (
        <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${colorClass}`}>{score}</span>
                <span className={`text-sm ${colorClass}`}>%</span>
            </div>
        </div>
    );
};

const ResultCard: React.FC<{title: string, children: React.ReactNode, icon: string, className?: string}> = ({title, children, icon, className}) => (
    <div className={className}>
        <h5 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
            <span className="text-xl mr-2">{icon}</span>
            {title}
        </h5>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">{children}</div>
    </div>
);

interface BrandAnalyzerProps {
    userData: UserData;
    report: WorldClassReport;
}

const BrandAnalyzer: React.FC<BrandAnalyzerProps> = ({ userData, report }) => {
    const [businessName, setBusinessName] = useState('');
    const [analysisResult, setAnalysisResult] = useState<BrandAnalysisV2 | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneAnalysis, setPhoneAnalysis] = useState<PhoneNumberAnalysis | null>(null);
    const [isPhoneLoading, setIsPhoneLoading] = useState(false);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    const [competitors, setCompetitors] = useState('');
    const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorBrandAnalysis[] | null>(null);
    const [isCompetitorLoading, setIsCompetitorLoading] = useState(false);
    const [competitorError, setCompetitorError] = useState<string | null>(null);

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessName.trim()) {
            setError('Please enter a business name to analyze.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        setCompetitorAnalysis(null);
        setCompetitors('');

        try {
            const result = await analyzeBrandName(
                businessName,
                userData.fullName,
                report.cosmicIdentity.coreNumbers.lifePath.number,
                report.cosmicIdentity.coreNumbers.expression.number,
                userData.language
            );
            setAnalysisResult(result);
            trackEvent('BRAND_ANALYZED', { businessName, score: result.vibrationalAlignmentScore });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to analyze brand name. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phoneNumber.trim()) {
            setPhoneError('Please enter a business phone number.');
            return;
        }
        setIsPhoneLoading(true);
        setPhoneError(null);
        setPhoneAnalysis(null);

        try {
            const result = await analyzePhoneNumber(phoneNumber, businessName || 'Your Business', userData.language);
            setPhoneAnalysis(result);
            trackEvent('PHONE_ANALYZED', { businessName, vibration: result.vibrationNumber });
        } catch(err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setPhoneError(`Failed to analyze phone number. ${errorMessage}`);
        } finally {
            setIsPhoneLoading(false);
        }
    }

    const handleCompetitorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const competitorNames = competitors.split(',').map(name => name.trim()).filter(Boolean);

        if (competitorNames.length === 0) {
            setCompetitorError('Please enter at least one competitor name, separated by commas.');
            return;
        }

        if (!analysisResult) {
            setCompetitorError('Please analyze your own brand name first.');
            return;
        }

        setIsCompetitorLoading(true);
        setCompetitorError(null);
        setCompetitorAnalysis(null);

        try {
            const result = await analyzeCompetitors(
                businessName,
                analysisResult.brandExpressionNumber,
                report.cosmicIdentity.coreNumbers.lifePath.number,
                report.cosmicIdentity.coreNumbers.expression.number,
                competitorNames,
                userData.language
            );
            setCompetitorAnalysis(result);
            trackEvent('COMPETITOR_ANALYZED', { competitorCount: competitorNames.length });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setCompetitorError(errorMessage);
        } finally {
            setIsCompetitorLoading(false);
        }
    };


    return (
        <div className="space-y-8">
            <div>
                <h4 className="text-xl font-bold gradient-text mb-3">AI Brand Alchemist</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Enter your business name to check its vibrational alignment with your core destiny numbers and generate brand assets.
                </p>
                <form onSubmit={handleNameSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full flex-grow input-cosmic"
                        placeholder="e.g., Apex Innovations"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="w-full sm:w-auto btn-cosmic"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Name'}
                    </button>
                </form>

                {error && <p className="text-[--rose-accent] text-sm mt-3">{error}</p>}

                {isLoading && (
                     <div className="mt-4 flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
                        <div className="loading-mandala !w-6 !h-6 !border-2"></div>
                        <span>Calculating Vibrational Synergy...</span>
                    </div>
                )}

                {analysisResult && (
                    <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg animate-slide-up space-y-6">
                        <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                            <ScoreGauge score={analysisResult.vibrationalAlignmentScore} />
                            <div className="flex-1">
                                 <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{analysisResult.brandArchetype}</p>
                                 <p className="text-sm text-gray-600 dark:text-gray-300">{analysisResult.detailedAnalysis}</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-purple-200 dark:border-purple-800/30">
                            <ResultCard title="Understanding the Expression Number" icon="🔢" className="md:col-span-2">
                                <p>{analysisResult.expressionNumberExplanation}</p>
                            </ResultCard>

                           <ResultCard title="Color Palette" icon="🎨">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border-2 border-white/50 dark:border-black/50" style={{backgroundColor: analysisResult.colorPalette.primary}}></div>
                                    <div className="w-8 h-8 rounded-full border-2 border-white/50 dark:border-black/50" style={{backgroundColor: analysisResult.colorPalette.secondary}}></div>
                                    <div className="w-8 h-8 rounded-full border-2 border-white/50 dark:border-black/50" style={{backgroundColor: analysisResult.colorPalette.accent}}></div>
                                    <p className="flex-1 text-xs">{analysisResult.colorPalette.explanation}</p>
                                </div>
                           </ResultCard>

                           <ResultCard title="Content Strategy" icon="💡">
                                <p>{analysisResult.contentStrategy}</p>
                           </ResultCard>
                           
                           {analysisResult.nameSuggestions?.length > 0 && (
                               <ResultCard title="Improvement Suggestions" icon="✍️" className="md:col-span-2">
                                    <ul className="list-disc pl-5">
                                       {analysisResult.nameSuggestions.map((name, i) => <li key={i}>{name}</li>)}
                                    </ul>
                               </ResultCard>
                           )}
                           
                           <ResultCard title="Social Media & Domain Ideas" icon="🌐" className="md:col-span-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <h6 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Handles</h6>
                                        <ul className="space-y-1">
                                            {analysisResult.socialMediaHandles.map((handle, i) => (
                                                <li key={i} className="flex items-center justify-between">
                                                    <span>@{handle.name}</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${handle.available ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                        {handle.available ? 'Available' : 'Taken'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                     <div>
                                        <h6 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Domains</h6>
                                        <ul className="space-y-1">
                                            {analysisResult.domainSuggestions.map((domain, i) => (
                                                 <li key={i} className="flex items-center justify-between">
                                                    <span>{domain.name}</span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${domain.available ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                                        {domain.available ? 'Available' : 'Taken'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                           </ResultCard>

                           {analysisResult.fortuneCompanyComparison?.length > 0 && (
                               <ResultCard title="Fortune 500 Resonance" icon="🏢" className="md:col-span-2">
                                    <div className="space-y-3">
                                        {analysisResult.fortuneCompanyComparison.map((comp, i) => (
                                            <div key={i} className="p-2 bg-black/5 dark:bg-white/5 rounded-md">
                                                <p className="font-semibold text-gray-700 dark:text-gray-200">
                                                    {comp.companyName} (Vibration: {comp.companyVibration})
                                                </p>
                                                <p className="text-xs">{comp.synergyAnalysis}</p>
                                            </div>
                                        ))}
                                    </div>
                               </ResultCard>
                           )}
                        </div>
                    </div>
                )}
            </div>

            {analysisResult && (
                 <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xl font-bold gradient-text mb-3">Competitor Vibration Analysis</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Gain a strategic edge by analyzing your competitors' brand vibrations. Enter their names, separated by commas.
                    </p>
                    <form onSubmit={handleCompetitorSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                            type="text"
                            value={competitors}
                            onChange={(e) => setCompetitors(e.target.value)}
                            className="w-full flex-grow input-cosmic"
                            placeholder="e.g., Brand X, Competitor Inc, Another Biz"
                            disabled={isCompetitorLoading}
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto btn-cosmic"
                            disabled={isCompetitorLoading}
                        >
                            {isCompetitorLoading ? 'Analyzing...' : 'Analyze Competitors'}
                        </button>
                    </form>

                    {competitorError && <p className="text-[--rose-accent] text-sm mt-3">{competitorError}</p>}

                    {isCompetitorLoading && (
                        <div className="mt-4 flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
                            <div className="loading-mandala !w-6 !h-6 !border-2"></div>
                            <span>Scanning the Competitive Landscape...</span>
                        </div>
                    )}

                    {competitorAnalysis && (
                        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg animate-slide-up space-y-4">
                            {competitorAnalysis.map((comp, i) => (
                                <div key={i} className="p-3 bg-black/5 dark:bg-white/5 rounded-md">
                                     <p className="font-semibold text-gray-800 dark:text-gray-100">
                                        {comp.competitorName} (Vibration: {comp.competitorVibration})
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{comp.comparisonAnalysis}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}


            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-xl font-bold gradient-text mb-3">Phone Number Vibration</h4>
                 <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    A business phone number also carries a vibration. Analyze its energy to see if it supports your brand's goals.
                </p>
                <form onSubmit={handlePhoneSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full flex-grow input-cosmic"
                        placeholder="e.g., +1 555 808 1234"
                        disabled={isPhoneLoading}
                    />
                    <button
                        type="submit"
                        className="w-full sm:w-auto btn-cosmic"
                        disabled={isPhoneLoading}
                    >
                        {isPhoneLoading ? 'Analyzing...' : 'Analyze Phone'}
                    </button>
                </form>

                 {phoneError && <p className="text-[--rose-accent] text-sm mt-3">{phoneError}</p>}

                {isPhoneLoading && (
                     <div className="mt-4 flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
                        <div className="loading-mandala !w-6 !h-6 !border-2"></div>
                        <span>Decoding Phone Energy...</span>
                    </div>
                )}

                {phoneAnalysis && (
                     <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg animate-slide-up flex items-center gap-4">
                         <div className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-full text-white shadow-lg ${phoneAnalysis.isFavorable ? 'bg-gradient-to-br from-[--sage-green] to-green-400' : 'bg-gradient-to-br from-[--gold-accent] to-orange-400'}`}>
                            <span className="text-3xl font-bold" style={{fontFamily: 'Cinzel, serif'}}>{phoneAnalysis.vibrationNumber}</span>
                         </div>
                         <div className="flex-1">
                            <p className="font-bold text-gray-800 dark:text-gray-100">{phoneAnalysis.isFavorable ? "Favorable Vibration" : "Challenging Vibration"}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{phoneAnalysis.analysis}</p>
                         </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default BrandAnalyzer;