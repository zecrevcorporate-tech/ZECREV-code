import React, { useState } from 'react';
import { generateRoadmapFromIdea } from '../services/geminiService';

interface RoadmapModalProps {
    onClose: () => void;
}

export const RoadmapModal: React.FC<RoadmapModalProps> = ({ onClose }) => {
    const [idea, setIdea] = useState('');
    const [roadmap, setRoadmap] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        setError('');
        setRoadmap('');
        try {
            let accumulatedRoadmap = '';
            for await (const chunk of generateRoadmapFromIdea(idea)) {
                accumulatedRoadmap += chunk;
                setRoadmap(accumulatedRoadmap);
            }
        } catch (e) {
            setError('Failed to generate roadmap. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(roadmap);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full text-gray-800 border border-gray-200 relative transform transition-all" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">AI Project Roadmap</h2>
                <p className="text-gray-500 mb-6 text-center">Describe your project, and the AI will generate a high-level development roadmap to guide you.</p>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="roadmap-idea-input" className="block text-sm font-medium text-gray-700 mb-1">Your Project Idea</label>
                        <textarea
                            id="roadmap-idea-input"
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="e.g., a social media app for pet owners"
                            className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                            rows={3}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button onClick={handleGenerate} disabled={isLoading || !idea.trim()} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center justify-center">
                        {isLoading ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</>
                        ) : 'Generate Roadmap'}
                    </button>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    {roadmap && (
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">AI Generated Roadmap</label>
                                <button onClick={handleCopy} className="text-sm text-blue-600 hover:text-blue-800 font-semibold">
                                    {isCopied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <pre className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg h-64 overflow-auto text-xs whitespace-pre-wrap font-sans">
                                {roadmap}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};