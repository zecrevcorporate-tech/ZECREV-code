import React, { useState, useEffect } from 'react';

interface ThemeChangerProps {
    onApplyTheme: (theme: string) => void;
    isLoading: boolean;
}

export const ThemeChanger: React.FC<ThemeChangerProps> = ({ onApplyTheme, isLoading }) => {
    const [themeInput, setThemeInput] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (themeInput.trim() && !isLoading) {
                onApplyTheme(themeInput.trim());
            }
        }, 1000); // 1 second debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [themeInput, onApplyTheme, isLoading]);

    return (
        <div className="flex items-center gap-2 w-full relative">
            <input
                type="text"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                placeholder="Apply a new theme... (e.g., dark mode)"
                className="w-full p-1 bg-gray-700 border border-gray-600 rounded-md text-xs text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-blue-500 transition pr-8"
                disabled={isLoading}
                aria-label="New theme description"
            />
            {isLoading && (
                 <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                 </div>
            )}
        </div>
    );
};