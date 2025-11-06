
import React from 'react';
import type { HistoryItem } from '../types';

interface HistorySidebarProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onClear: () => void;
    isVisible: boolean;
    onToggle: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear, isVisible, onToggle }) => {
    return (
        <aside className={`absolute top-0 left-0 h-full bg-violet-800 text-white flex flex-col transition-transform duration-300 ease-in-out ${isVisible ? 'translate-x-0' : '-translate-x-full'} w-64 z-10`}>
            <div className="flex items-center justify-between p-4 border-b border-violet-700">
                <h2 className="text-lg font-semibold">History</h2>
                <button onClick={onClear} className="text-sm text-violet-300 hover:text-white disabled:opacity-50" disabled={history.length === 0}>
                    Clear
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {history.length > 0 ? (
                    <ul>
                        {history.map((item) => (
                            <li key={item.id} className="border-b border-violet-700">
                                <button onClick={() => onSelect(item)} className="w-full text-left p-4 hover:bg-violet-700 transition-all duration-200 ease-in-out hover:translate-x-1">
                                    <p className="text-sm font-medium truncate">{item.prompt}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-4 text-center text-violet-300">
                        Your generation history will appear here.
                    </div>
                )}
            </div>
             <button
                onClick={onToggle}
                className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-violet-800 p-2 rounded-r-lg text-white transition-transform duration-200 ease-in-out hover:scale-110"
            >
                {isVisible ? 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg> :
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                }
            </button>
        </aside>
    );
};