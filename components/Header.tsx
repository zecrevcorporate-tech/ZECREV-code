import React, { useState, useRef, useEffect } from 'react';
import type { HistoryItem } from '../types';
import { HistoryDropdown } from './HistoryDropdown';

interface HeaderProps {
    onDeployClick: () => void;
    onNewProjectClick: () => void;
    onIdeaClick: () => void;
    onRoadmapClick: () => void;
    history: HistoryItem[];
    onHistorySelect: (item: HistoryItem) => void;
    onClearHistory: () => void;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    onDeployClick, 
    onNewProjectClick, 
    onIdeaClick,
    onRoadmapClick,
    history, 
    onHistorySelect, 
    onClearHistory,
    onLogout
}) => {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
                setIsHistoryOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [historyRef]);

    return (
        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h1 className="text-2xl font-bold">
                <span className="text-blue-600">ZECREV</span>
                <span className="text-gray-800">CODEZ</span>
            </h1>
            <div className="flex items-center gap-2">
                <button
                    onClick={onIdeaClick}
                    className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-200 ease-in-out flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm-.707 10.607a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" /></svg>
                    Idea to Prompt
                </button>
                <button
                    onClick={onRoadmapClick}
                    className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-200 ease-in-out flex items-center gap-2"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                    Roadmap
                </button>
                <div className="relative" ref={historyRef}>
                    <button
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-200 ease-in-out flex items-center gap-2"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                        History
                    </button>
                    {isHistoryOpen && (
                        <HistoryDropdown 
                            history={history} 
                            onSelect={(item) => {
                               onHistorySelect(item);
                               setIsHistoryOpen(false); 
                            }} 
                            onClear={() => {
                                onClearHistory();
                                setIsHistoryOpen(false);
                            }} 
                        />
                    )}
                </div>
                 <button 
                    onClick={onNewProjectClick}
                    className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-200 ease-in-out flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    New Project
                </button>
                <button 
                    onClick={onDeployClick}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Deploy
                </button>
                <div className="w-px h-6 bg-gray-200 mx-2"></div>
                <div className="relative group">
                    <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                            Z
                        </div>
                        <span className="text-sm font-semibold text-gray-700 hidden sm:block">ZECREV User</span>
                        <svg className="h-4 w-4 text-gray-500 hidden sm:block" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible">
                        <button 
                            onClick={onLogout}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};