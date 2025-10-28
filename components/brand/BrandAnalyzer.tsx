
import React, { useState } from 'react';
import { analyzeBrandName } from '../../services/geminiService';
import type { UserData, WorldClassReport } from '../../types';
import MarkdownRenderer from '../common/MarkdownRenderer';

interface BrandAnalyzerProps {
    userData: UserData;
    report: WorldClassReport;
}

const BrandAnalyzer: React.FC<BrandAnalyzerProps> = ({ userData, report }) => {
    const [businessName, setBusinessName] = useState('');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!businessName.trim()) {
            setError('Please enter a business name to analyze.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeBrandName(
                businessName,
                userData.fullName,
                report.cosmicIdentity.coreNumbers.lifePath.number,
                report.cosmicIdentity.coreNumbers.expression.number,
                userData.language
            );
            setAnalysisResult(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to analyze brand name. ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h4 className="text-xl font-bold text-cosmic-gold font-display mb-3">AI Brand Analyzer</h4>
            <p className="text-sm text-lunar-grey mb-4">
                Enter your business name to check its vibrational alignment with your core destiny numbers.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full flex-grow bg-deep-void/50 border border-lunar-grey/50 text-starlight rounded-lg px-4 py-2 focus:ring-2 focus:ring-cosmic-gold focus:border-cosmic-gold outline-none transition-all"
                    placeholder="e.g., Apex Innovations"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="w-full sm:w-auto bg-cosmic-gold text-deep-void font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cosmic-gold/20 disabled:bg-lunar-grey disabled:scale-100 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? 'Analyzing...' : 'Analyze'}
                </button>
            </form>

            {error && <p className="text-cosmic-gold/90 text-sm mt-3">{error}</p>}

            {isLoading && (
                 <div className="mt-4 flex items-center justify-center space-x-2 text-lunar-grey">
                    <div className="w-6 h-6 border-2 border-lunar-grey border-t-cosmic-gold rounded-full animate-spin"></div>
                    <span>Calculating Vibrational Synergy...</span>
                </div>
            )}

            {analysisResult && (
                <div className="mt-6 p-4 bg-deep-void/30 border border-lunar-grey/10 rounded-lg animate-slide-up">
                    <MarkdownRenderer content={analysisResult} />
                </div>
            )}
        </div>
    );
};

export default BrandAnalyzer;