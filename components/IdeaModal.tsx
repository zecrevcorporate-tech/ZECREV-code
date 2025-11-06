import React, { useState } from 'react';
import { generatePromptFromIdea } from '../services/geminiService';

interface IdeaModalProps {
    onClose: () => void;
    onUsePrompt: (prompt: string) => void;
}

export const IdeaModal: React.FC<IdeaModalProps> = ({ onClose, onUsePrompt }) => {
    const [idea, setIdea] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        setError('');
        setGeneratedPrompt('');
        try {
            let accumulatedPrompt = '';
            for await (const chunk of generatePromptFromIdea(idea)) {
                accumulatedPrompt += chunk;
                setGeneratedPrompt(accumulatedPrompt);
            }
        } catch (e) {
            setError('Failed to generate prompt. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUsePrompt = () => {
        onUsePrompt(generatedPrompt);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full text-gray-800 border border-gray-200 relative transform transition-all" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">Idea to Prompt</h2>
                <p className="text-gray-500 mb-6 text-center">Enter a simple idea, and the AI will expand it into a detailed prompt for better results.</p>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="idea-input" className="block text-sm font-medium text-gray-700 mb-1">Your Idea</label>
                        <textarea
                            id="idea-input"
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="e.g., a modern portfolio website for a photographer"
                            className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button onClick={handleGenerate} disabled={isLoading || !idea.trim()} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center justify-center">
                        {isLoading ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</>
                        ) : 'Generate Detailed Prompt'}
                    </button>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    {generatedPrompt && (
                        <div>
                            <label htmlFor="generated-prompt" className="block text-sm font-medium text-gray-700 mb-1">AI Generated Prompt</label>
                            <textarea
                                id="generated-prompt"
                                value={generatedPrompt}
                                readOnly
                                className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg h-40"
                                rows={8}
                            />
                             <button onClick={handleUsePrompt} className="mt-4 w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
                                Use This Prompt
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};