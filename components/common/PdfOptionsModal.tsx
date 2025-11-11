import React, { useState, useEffect } from 'react';
import { exportReportAsPDF } from '../../services/pdfService';
import { Loader } from './Icons';

interface PdfOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const ALL_SECTIONS = [
    { key: 'kundaliSnapshot', name: 'Kundali Snapshot' },
    { key: 'jyotish', name: 'Jyotish Deep Dive' },
    { key: 'cosmicIdentity', name: 'Cosmic Identity' },
    { key: 'birthDestinyCombination', name: 'Birth & Destiny Analysis' },
    { key: 'loshuAnalysis', name: 'Loshu Grid' },
    { key: 'wealthBusinessCareer', name: 'Wealth & Career' },
    { key: 'healthEnergyWellness', name: 'Health & Wellness' },
    { key: 'relationshipsFamilyLegacy', name: 'Relationships & Family' },
    { key: 'psychologyShadowWork', name: 'Psychology & Shadow Work' },
    { key: 'dailyNavigator', name: 'Daily Navigator' },
    { key: 'spiritualAlignment', name: 'Spiritual Alignment' },
    { key: 'intellectEducation', name: 'Intellect & Education' },
    { key: 'futureForecast', name: 'Future Forecast' },
    { key: 'methodology', name: 'Methodology' },
    { key: 'nextSteps', name: 'Your Journey Continues' },
];

const PDF_SECTIONS_STORAGE_KEY = 'vidhiraPdfSelectedSections';
const PDF_THEME_STORAGE_KEY = 'vidhiraPdfTheme';


const PdfOptionsModal: React.FC<PdfOptionsModalProps> = ({ isOpen, onClose, userName }) => {
    const [selectedSections, setSelectedSections] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(PDF_SECTIONS_STORAGE_KEY);
            return saved ? JSON.parse(saved) : ALL_SECTIONS.map(s => s.key);
        } catch (e) {
            return ALL_SECTIONS.map(s => s.key);
        }
    });

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const saved = localStorage.getItem(PDF_THEME_STORAGE_KEY);
        return saved === 'light' ? 'light' : 'dark';
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem(PDF_SECTIONS_STORAGE_KEY, JSON.stringify(selectedSections));
    }, [selectedSections]);

    useEffect(() => {
        localStorage.setItem(PDF_THEME_STORAGE_KEY, theme);
    }, [theme]);

    const handleSectionToggle = (sectionKey: string) => {
        setSelectedSections(prev =>
            prev.includes(sectionKey) ? prev.filter(s => s !== sectionKey) : [...prev, sectionKey]
        );
    };
    
    const handleSelectAll = (select: boolean) => {
        setSelectedSections(select ? ALL_SECTIONS.map(s => s.key) : []);
    };

    const handleGeneratePdf = async () => {
        setError(null);
        if (selectedSections.length === 0) {
            setError('Please select at least one section to include in the report.');
            return;
        }

        setIsGenerating(true);
        try {
            await exportReportAsPDF(userName, { sections: selectedSections, theme });
            onClose();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(`Failed to generate PDF: ${message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print" onClick={onClose}>
            <div
                className="glass-card w-full max-w-lg p-6 md:p-8 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white" style={{ fontFamily: 'Playfair Display, serif' }}>Customize PDF Export</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Select the content for your personalized report.</p>
                    </div>
                     <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-3xl leading-none">&times;</button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Include Sections</h4>
                        <div className="flex items-center gap-4 mb-3 text-sm">
                           <button onClick={() => handleSelectAll(true)} className="text-[--cosmic-purple] dark:text-[--gold-accent] hover:underline">Select All</button>
                           <button onClick={() => handleSelectAll(false)} className="text-[--cosmic-purple] dark:text-[--gold-accent] hover:underline">Deselect All</button>
                        </div>
                        <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pr-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                            {ALL_SECTIONS.map(section => (
                                <label key={section.key} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedSections.includes(section.key)}
                                        onChange={() => handleSectionToggle(section.key)}
                                        className="h-4 w-4 rounded bg-transparent border-gray-400 dark:border-gray-500 text-[--cosmic-purple] focus:ring-[--cosmic-purple] focus:ring-offset-0"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300 text-sm">{section.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Select Theme</h4>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} className="text-[--cosmic-purple] focus:ring-[--cosmic-purple]" />
                                <span className="text-gray-700 dark:text-gray-300">Dark (Default)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} className="text-[--cosmic-purple] focus:ring-[--cosmic-purple]" />
                                <span className="text-gray-700 dark:text-gray-300">Light (Print-Friendly)</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-[--rose-accent] text-sm mt-4 text-center">{error}</p>}

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                     <button
                        onClick={onClose}
                        className="w-full btn-cosmic bg-gray-500 hover:bg-gray-600 shadow-none"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGeneratePdf}
                        disabled={isGenerating}
                        className="w-full btn-cosmic"
                    >
                        {isGenerating ? (<><Loader className="animate-spin" /> Generating...</>) : 'Generate PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PdfOptionsModal;
