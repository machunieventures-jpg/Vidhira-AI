import React, { useState, useEffect } from 'react';
import { getBirthDestinyCombinationInterpretation } from '../services/geminiService';
import type { UserData } from '../types';
import MarkdownRenderer from './common/MarkdownRenderer';

interface BirthDestinyCombinationProps {
    birthNumber: number;
    destinyNumber: number;
    userData: UserData;
}

const BirthDestinyCombination: React.FC<BirthDestinyCombinationProps> = ({ birthNumber, destinyNumber, userData }) => {
    const [interpretation, setInterpretation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInterpretation = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await getBirthDestinyCombinationInterpretation(birthNumber, destinyNumber, userData.fullName, userData.language);
                setInterpretation(result);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterpretation();
    }, [birthNumber, destinyNumber, userData.fullName, userData.language]);

    return (
        <div>
            <div className="text-center mb-6">
                 <h4 className="text-xl font-bold gradient-text mb-3">Your Core Life Drivers</h4>
                 <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    The relationship between your Birth Number (your personality and core identity) and your Destiny Number (your life's purpose and path) is the most crucial aspect of your numerological chart. Understanding their synergy reveals your unique blueprint for success.
                </p>
            </div>
            {isLoading && (
                <div className="flex flex-col items-center justify-center space-y-3 text-center p-4">
                    <div className="loading-mandala !w-12 !h-12 !border-4"></div>
                    <p className="font-semibold text-gray-600 dark:text-gray-300">Analyzing your core combination...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This is one of the most important aspects of your chart.</p>
                </div>
            )}
            {error && (
                <div className="p-4 text-center">
                    <p className="text-[--rose-accent] text-sm">{error}</p>
                </div>
            )}
            {interpretation && (
                <div className="animate-slide-up p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <MarkdownRenderer content={interpretation} />
                </div>
            )}
        </div>
    );
};

export default BirthDestinyCombination;