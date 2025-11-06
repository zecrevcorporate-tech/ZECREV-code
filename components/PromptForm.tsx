import React, { useState, useRef, useEffect } from 'react';
import type { LoadingAction } from '../types';

// Fix: Add type definitions for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    item: (index: number) => SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}


interface PromptFormProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: (prompt: string) => void;
    loadingAction: LoadingAction;
    onImageClick: () => void;
    onFullStackClick: () => void;
}

export const PromptForm: React.FC<PromptFormProps> = ({ prompt, setPrompt, onGenerate, loadingAction, onImageClick, onFullStackClick }) => {
    const [url, setUrl] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const isLoading = loadingAction !== null;

    useEffect(() => {
        const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionImpl) {
            recognitionRef.current = new SpeechRecognitionImpl();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setPrompt(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [setPrompt]);


    const handleToggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleGenerateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(prompt);
    };

    const handleCloneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            onGenerate(`clone:${url.trim()}`);
        }
    };

    const buttonBaseClasses = "px-4 py-3 text-white font-semibold rounded-lg transition-all duration-200 ease-in-out flex items-center justify-center";
    const enabledClasses = "bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95";
    const disabledClasses = "bg-blue-300 cursor-not-allowed";

    const loadingSpinner = (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200 shadow-md">
            <div className="flex gap-2">
                 <form onSubmit={handleGenerateSubmit} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the website you want to build..."
                            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition pr-10"
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={handleToggleListening}
                            disabled={!recognitionRef.current || isLoading}
                            className={`absolute inset-y-0 right-0 flex items-center pr-3 ${isListening ? 'text-red-500' : 'text-gray-500'} hover:text-blue-600 disabled:text-gray-300`}
                            title={isListening ? "Stop listening" : "Start listening"}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm5 3a1 1 0 11-2 0V4a1 1 0 112 0v3zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                <path d="M13 10a1 1 0 011 1v1a5 5 0 01-10 0v-1a1 1 0 112 0v1a3 3 0 006 0v-1a1 1 0 011-1z" />
                            </svg>
                        </button>
                    </div>
                    <button
                        type="submit"
                        className={`${buttonBaseClasses} ${isLoading || !prompt ? disabledClasses : enabledClasses}`}
                        disabled={isLoading || !prompt}
                    >
                        {loadingAction === 'generate' ? (
                            <>{loadingSpinner} Generating...</>
                        ) : 'Generate'}
                    </button>
                </form>
                <button
                    type="button"
                    onClick={onImageClick}
                    className="px-4 py-3 bg-gray-600 text-white font-semibold rounded-lg transition-all duration-200 ease-in-out hover:bg-gray-700 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    disabled={isLoading}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                     Image
                </button>
                <button
                    type="button"
                    onClick={onFullStackClick}
                    className="px-4 py-3 bg-gray-800 text-white font-semibold rounded-lg transition-all duration-200 ease-in-out hover:bg-black hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    disabled={isLoading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" /><path d="M3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>
                    Full-Stack
                </button>
            </div>


            <div className="flex items-center text-xs text-gray-400 uppercase">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-2">Or</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <form onSubmit={handleCloneSubmit} className="flex gap-2">
                 <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    disabled={isLoading}
                    aria-label="Website URL to clone"
                />
                <button
                    type="submit"
                    className={`${buttonBaseClasses} ${isLoading || !url.trim() ? disabledClasses : enabledClasses}`}
                    disabled={isLoading || !url.trim()}
                >
                     {loadingAction === 'clone' ? (
                        <>{loadingSpinner} Cloning...</>
                    ) : 'Clone'}
                </button>
            </form>
        </div>
    );
};