import React, { useState, useEffect } from 'react';
import type { UserData } from '../../types';
import type { Theme } from '../../App';
import { Loader } from './Icons';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
  onSave: (data: UserData) => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const LANGUAGES = [
    { value: 'English', label: 'English' },
    { value: 'Nepali', label: 'नेपाली (Nepali)' },
    { value: 'Spanish', label: 'Español (Spanish)' },
    { value: 'French', label: 'Français (French)' },
    { value: 'German', label: 'Deutsch (German)' },
    { value: 'Hindi', label: 'हिन्दी (Hindi)' },
    { value: 'Portuguese', label: 'Português (Portuguese)' },
];

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose, userData, onSave, currentTheme, onThemeChange }) => {
    const [localSettings, setLocalSettings] = useState<Partial<UserData>>({ language: userData.language });

    useEffect(() => {
        if (isOpen) {
            setLocalSettings({ language: userData.language });
        }
    }, [isOpen, userData.language]);

    const handleSave = () => {
        onSave({ ...userData, ...localSettings } as UserData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print" onClick={onClose} aria-modal="true" role="dialog">
            <div
                className="glass-card w-full max-w-md p-6 md:p-8 animate-cosmic-reveal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white" style={{ fontFamily: 'Playfair Display, serif' }}>User Settings</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your preferences.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white text-3xl leading-none" aria-label="Close settings">&times;</button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Profile Information</h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                            <p><strong>Name:</strong> {userData.fullName}</p>
                            <p><strong>Date of Birth:</strong> {userData.dob}</p>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="language-select" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Preferred Language</label>
                        <select
                            id="language-select"
                            className="input-cosmic w-full"
                            value={localSettings.language}
                            onChange={(e) => setLocalSettings(prev => ({ ...prev, language: e.target.value }))}
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This will be used for your next generated report.</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Display Theme</h4>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="theme" value="dark" checked={currentTheme === 'dark'} onChange={() => onThemeChange('dark')} className="text-[--cosmic-purple] focus:ring-[--cosmic-purple]" />
                                <span className="text-gray-700 dark:text-gray-300">Dark (Default)</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="radio" name="theme" value="light" checked={currentTheme === 'light'} onChange={() => onThemeChange('light')} className="text-[--cosmic-purple] focus:ring-[--cosmic-purple]" />
                                <span className="text-gray-700 dark:text-gray-300">Light</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} className="w-full btn-cosmic bg-gray-500 hover:bg-gray-600 shadow-none">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="w-full btn-cosmic">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserSettingsModal;