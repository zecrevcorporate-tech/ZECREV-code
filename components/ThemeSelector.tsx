import React from 'react';
import type { EditorTheme } from '../types';

interface ThemeSelectorProps {
    selectedTheme: EditorTheme;
    onThemeChange: (theme: EditorTheme) => void;
}

const themes: EditorTheme[] = ['dark', 'dracula', 'solarized', 'light'];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ selectedTheme, onThemeChange }) => {
    return (
        <div className="relative">
            <select
                value={selectedTheme}
                onChange={(e) => onThemeChange(e.target.value as EditorTheme)}
                className="bg-gray-700 text-white text-xs rounded-md pl-2 pr-7 py-1 appearance-none focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                aria-label="Select code editor theme"
            >
                {themes.map(theme => (
                    <option key={theme} value={theme} className="capitalize">{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
        </div>
    );
};