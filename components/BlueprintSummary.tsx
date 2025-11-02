import React from 'react';
import type { WorldClassReport, UserData } from '../types';

// Icons
const Crown = ({ size = 24, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>;
const Lock = ({ size = 16, className = '' }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;


interface BlueprintSummaryProps {
  report: WorldClassReport;
  userData: UserData;
  onUnlock: () => void;
}

const NumberBadge: React.FC<{ label: string; number: number; }> = ({ label, number }) => (
    <div className="text-center">
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[--cosmic-purple] to-[--gold-accent] text-white text-4xl font-bold shadow-lg animate-slide-up" style={{fontFamily: 'Cinzel, serif'}}>
            {number}
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</p>
    </div>
);

const BlueprintSummary: React.FC<BlueprintSummaryProps> = ({ report, userData, onUnlock }) => {
    const { cosmicIdentity } = report;

    const pillars = [
        { title: 'Cosmic Identity', icon: '✨', unlocked: true },
        { title: 'Life Purpose & Destiny', icon: '🎯', unlocked: false },
        { title: 'Wealth & Abundance', icon: '💰', unlocked: false },
        { title: 'Love & Relationships', icon: '❤️', unlocked: false },
        { title: 'Health & Vitality', icon: '🌿', unlocked: false },
        { title: 'Career & Success', icon: '🚀', unlocked: false },
    ];

    return (
        <div className="min-h-screen p-4 md:p-8 relative z-10 animate-slide-up">
            <div className="max-w-6xl mx-auto">
                <div className="glass-card mb-8 text-center">
                    <h2 className="text-4xl font-bold gradient-text mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {userData.fullName}'s Cosmic Blueprint
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Your vibrational signature has been decoded. Here is a glimpse into your soul's map.</p>

                    <div className="flex flex-wrap justify-center gap-6 mb-8">
                        <NumberBadge label="Life Path" number={cosmicIdentity.coreNumbers.lifePath.number} />
                        <NumberBadge label="Expression" number={cosmicIdentity.coreNumbers.expression.number} />
                        <NumberBadge label="Soul Urge" number={cosmicIdentity.coreNumbers.soulUrge.number} />
                        <NumberBadge label="Personality" number={cosmicIdentity.coreNumbers.personality.number} />
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 mb-6">
                        <h3 className="text-xl font-bold text-purple-900 dark:text-purple-200 mb-3">✨ Your Free Summary: Cosmic Identity</h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                           {cosmicIdentity.soulSynopsis.teaser} {report.kundaliSnapshot.summary}
                        </p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Unlock Your Full Potential</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {pillars.slice(1).map((section, idx) => (
                                <div key={idx} className="bg-white dark:bg-[--cosmic-blue] rounded-xl p-4 border-2 border-purple-100 dark:border-purple-800 relative">
                                    <div className="absolute top-2 right-2">
                                        <Lock size={16} className="text-purple-400" />
                                    </div>
                                    <div className="text-3xl mb-2">{section.icon}</div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2">{section.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Unlock to reveal deep insights.</p>
                                </div>
                            ))}
                        </div>

                        <button className="btn-cosmic text-xl px-12 py-4" onClick={onUnlock}>
                            <Crown size={24} />
                            Unlock Full Report - $9.99
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">One-time payment • Lifetime access • Money-back guarantee</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlueprintSummary;
