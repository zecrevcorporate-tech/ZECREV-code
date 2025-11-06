import React, { useState } from 'react';
import { refactorCodeStream } from '../services/geminiService';

interface RefactorModalProps {
    onClose: () => void;
    selectedCode: string;
    onRefactor: (action: string) => Promise<void>;
}

type RefactorAction = "Refactor for Readability" | "Optimize for Performance" | "Add Comments" | "Explain Code";

export const RefactorModal: React.FC<RefactorModalProps> = ({ onClose, selectedCode, onRefactor }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [explanation, setExplanation] = useState('');

    const handleActionClick = async (action: RefactorAction) => {
        setIsLoading(true);
        setError('');
        setExplanation('');
        try {
            if (action === "Explain Code") {
                let accumulatedExplanation = '';
                for await (const chunk of refactorCodeStream(selectedCode, action)) {
                    accumulatedExplanation += chunk;
                    setExplanation(accumulatedExplanation);
                }
            } else {
                await onRefactor(action);
                onClose();
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(`Failed to perform action: ${action}. ${message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const actions: RefactorAction[] = ["Refactor for Readability", "Optimize for Performance", "Add Comments", "Explain Code"];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full text-gray-800 border border-gray-200 relative transform transition-all flex flex-col" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">AI Code Assistant</h2>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selected Code</label>
                    <pre className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg h-40 overflow-auto text-xs whitespace-pre-wrap font-mono">
                        <code>{selectedCode}</code>
                    </pre>
                </div>

                <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Choose an action:</p>
                    <div className="grid grid-cols-2 gap-2">
                        {actions.map(action => (
                            <button 
                                key={action}
                                onClick={() => handleActionClick(action)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:bg-gray-200 disabled:text-gray-400 transition"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && <p className="text-center mt-4 text-blue-600 animate-pulse">AI is working...</p>}
                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                
                {explanation && (
                    <div className="mt-6">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                         <div className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg h-32 overflow-auto text-sm">
                            {explanation}
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};