import React from 'react';
import type { HistoryItem } from '../types';

interface HistoryDropdownProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onClear: () => void;
}

export const HistoryDropdown: React.FC<HistoryDropdownProps> = ({ history, onSelect, onClear }) => {
    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
                <h3 className="text-md font-semibold text-gray-700">Generation History</h3>
                <button 
                    onClick={onClear} 
                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50" 
                    disabled={history.length === 0}
                >
                    Clear
                </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {history.length > 0 ? (
                    <ul>
                        {history.map((item) => (
                            <li key={item.id} className="border-b border-gray-200 last:border-b-0">
                                <button 
                                    onClick={() => onSelect(item)} 
                                    className="w-full text-left p-3 hover:bg-gray-100 transition-colors duration-200 ease-in-out"
                                >
                                    <p className="text-sm font-medium truncate text-gray-700">{item.prompt}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                        No history yet.
                    </div>
                )}
            </div>
        </div>
    );
};