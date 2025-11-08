import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { trackEvent } from '../services/analyticsService';
import { Upload, Sparkles, Loader } from './common/Icons';

const ImageEditor: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [originalImageType, setOriginalImageType] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
                setError('File size must be less than 4MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setOriginalImageType(file.type);
                setEditedImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditClick = async () => {
        if (!originalImage || !prompt.trim() || !originalImageType) {
            setError('Please upload an image and provide an editing prompt.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const base64Data = originalImage.split(',')[1];
            const result = await editImage(base64Data, originalImageType, prompt);
            setEditedImage(result);
            trackEvent('IMAGE_EDITED', { promptLength: prompt.length });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
             <h4 className="text-xl font-bold gradient-text mb-3">Cosmic Image Editor</h4>
             <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Use AI to magically edit your images. Upload a picture, describe your desired change, and let Vidhira reshape your reality.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Side: Upload & Prompt */}
                <div className="space-y-4">
                    <div 
                        className="relative w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-center text-gray-500 dark:text-gray-400 cursor-pointer hover:border-[--cosmic-purple] dark:hover:border-[--gold-accent] transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                        />
                        {originalImage ? (
                            <img src={originalImage} alt="Original" className="w-full h-full object-contain rounded-xl p-2" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload size={40} />
                                <p className="mt-2 font-semibold">Click to upload an image</p>
                                <p className="text-xs">PNG, JPG, WEBP up to 4MB</p>
                            </div>
                        )}
                    </div>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="input-cosmic w-full"
                        placeholder="e.g., 'Add a retro filter', 'Make the sky look like a galaxy', 'Remove the person in the background'"
                        rows={3}
                        disabled={isLoading}
                    />
                    
                    <button
                        onClick={handleEditClick}
                        disabled={isLoading || !originalImage || !prompt.trim()}
                        className="btn-cosmic w-full"
                    >
                        {isLoading ? (
                            <><Loader className="animate-spin" /> Transmuting Image...</>
                        ) : (
                            <><Sparkles /> Apply Magic Edit</>
                        )}
                    </button>
                </div>

                {/* Right Side: Result */}
                <div className="w-full h-64 border-2 border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                    {isLoading && (
                         <div className="flex flex-col items-center">
                            <div className="loading-mandala !w-12 !h-12 !border-4"></div>
                            <p className="mt-2 text-sm font-semibold">Editing in progress...</p>
                        </div>
                    )}
                    {error && !isLoading && (
                        <div className="p-4 text-[--rose-accent]">
                            <p className="font-semibold">Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                    {!isLoading && !error && editedImage && (
                        <img src={editedImage} alt="Edited" className="w-full h-full object-contain rounded-xl p-2" />
                    )}
                    {!isLoading && !error && !editedImage && (
                        <p>Your edited image will appear here</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
