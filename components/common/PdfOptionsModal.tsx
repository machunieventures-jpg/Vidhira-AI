import React, { useState, useEffect } from 'react';
import { exportReportAsPDF } from '../../services/pdfService';

interface PdfOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const ALL_SECTIONS = [
    { key: 'kundaliSnapshot', name: 'Vedic Kundali Snapshot' },
    { key: 'jyotish', name: 'Vedic Astrology Deep Dive' },
    { key: 'cosmicIdentity', name: 'Cosmic Identity (Numerology)' },
    { key: 'loshuAnalysis', name: 'Loshu Grid' },
    { key: 'wealthBusinessCareer', name: 'Wealth, Business & Career' },
    { key: 'healthEnergyWellness', name: 'Health, Energy & Wellness' },
    { key: 'relationshipsFamilyLegacy', name: 'Relationships & Family' },
    { key: 'psychologyShadowWork', name: 'Psychology & Shadow Work' },
    { key: 'dailyNavigator', name: 'Daily Navigator & Timing' },
    { key: 'spiritualAlignment', name: 'Spiritual Alignment' },
    { key: 'intellectEducation', name: 'Intellect & Education' },
    { key: 'futureForecast', name: 'Future Forecast' },
    { key: 'about', name: 'About Vidhira' },
];

// Local storage keys
const PDF_SECTIONS_STORAGE_KEY = 'vidhiraPdfSelectedSections';
const PDF_THEME_STORAGE_KEY = 'vidhiraPdfTheme';


const PdfOptionsModal: React.FC<PdfOptionsModalProps> = ({ isOpen, onClose, userName }) => {
    // Lazy initialize state from localStorage
    const [selectedSections, setSelectedSections] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(PDF_SECTIONS_STORAGE_KEY);
            return saved ? JSON.parse(saved) : ALL_SECTIONS.map(s => s.key);
        } catch (e) {
            console.error("Failed to parse saved sections from localStorage", e);
            return ALL_SECTIONS.map(s => s.key);
        }
    });

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const saved = localStorage.getItem(PDF_THEME_STORAGE_KEY);
        return saved === 'light' ? 'light' : 'dark';
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

     // Effect to save selected sections to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(PDF_SECTIONS_STORAGE_KEY, JSON.stringify(selectedSections));
    }, [selectedSections]);

    // Effect to save theme to localStorage whenever it changes
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
            onClose(); // Close modal on success
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
                className="bg-void-tint w-full max-w-lg rounded-2xl shadow-2xl border border-lunar-grey/20 p-6 md:p-8 text-starlight animate-modal-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold font-display">Customize PDF Report</h3>
                    <button onClick={onClose} className="text-starlight/70 hover:text-starlight text-3xl leading-none">&times;</button>
                </div>
                
                <div className="space-y-6">
                    {/* Section Selection */}
                    <div>
                        <h4 className="text-lg font-semibold text-cosmic-gold mb-3">Include Sections</h4>
                        <div className="flex items-center gap-4 mb-3 text-sm">
                           <button onClick={() => handleSelectAll(true)} className="text-cosmic-gold/80 hover:text-cosmic-gold">Select All</button>
                           <button onClick={() => handleSelectAll(false)} className="text-cosmic-gold/80 hover:text-cosmic-gold">Deselect All</button>
                        </div>
                        <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pr-2">
                            {ALL_SECTIONS.map(section => (
                                <label key={section.key} className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedSections.includes(section.key)}
                                        onChange={() => handleSectionToggle(section.key)}
                                        className="h-4 w-4 rounded bg-deep-void border-lunar-grey/50 text-cosmic-gold focus:ring-cosmic-gold"
                                    />
                                    <span className="text-starlight/90 text-sm">{section.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Theme Selection */}
                    <div>
                        <h4 className="text-lg font-semibold text-cosmic-gold mb-3">Select Theme</h4>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => setTheme('dark')} className="text-cosmic-gold focus:ring-cosmic-gold" />
                                <span>Dark (Default)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => setTheme('light')} className="text-cosmic-gold focus:ring-cosmic-gold" />
                                <span>Light (Print-Friendly)</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-cosmic-gold/90 text-sm mt-4 text-center">{error}</p>}

                <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
                     <button
                        onClick={onClose}
                        className="w-full border border-lunar-grey/50 text-lunar-grey font-bold py-3 px-4 rounded-lg hover:bg-lunar-grey/20 hover:text-starlight transition-all duration-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGeneratePdf}
                        disabled={isGenerating}
                        className="w-full bg-cosmic-gold text-deep-void font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cosmic-gold/20 hover:shadow-[0_0_15px_var(--lucky-color-glow)] disabled:bg-lunar-grey disabled:opacity-75 disabled:cursor-wait disabled:scale-100"
                    >
                        {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PdfOptionsModal;