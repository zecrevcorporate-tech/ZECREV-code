import React, { useCallback } from 'react';
import type { EditorTab, EditorTheme } from '../types';
import { CodeDisplay } from './CodeDisplay';
import { CustomCssInput } from './CustomCssInput';
import { ThemeSelector } from './ThemeSelector';

interface EditorTabsProps {
    activeTab: EditorTab;
    setActiveTab: (tab: EditorTab) => void;
    code: string;
    customCss: string;
    onCodeChange: (newCode: string) => void;
    onCustomCssChange: (css: string) => void;
    onRegenerate: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onSaveProject: () => void;
    canUndo: boolean;
    canRedo: boolean;
    isLoading: boolean;
    editorTheme: EditorTheme;
    setEditorTheme: (theme: EditorTheme) => void;
    htmlEditorRef: React.RefObject<HTMLTextAreaElement>;
    cssEditorRef: React.RefObject<HTMLTextAreaElement>;
    onRefactorClick: () => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({ 
    activeTab, 
    setActiveTab, 
    code, 
    customCss, 
    onCodeChange, 
    onCustomCssChange, 
    onRegenerate, 
    onUndo, 
    onRedo,
    onSaveProject,
    canUndo, 
    canRedo, 
    isLoading,
    editorTheme,
    setEditorTheme,
    htmlEditorRef,
    cssEditorRef,
    onRefactorClick
}) => {
    const handleDownload = useCallback(() => {
        const fullCode = activeTab === 'html' 
            ? code.replace('</head>', `<style>${customCss}</style></head>`)
            : customCss;
        const blob = new Blob([fullCode], { type: activeTab === 'html' ? 'text/html' : 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeTab === 'html' ? 'index.html' : 'styles.css';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [code, customCss, activeTab]);

    const handleCopy = useCallback(() => {
        const textToCopy = activeTab === 'html' ? code : customCss;
        navigator.clipboard.writeText(textToCopy);
    }, [code, customCss, activeTab]);

    const iconButtonClasses = "p-2 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out hover:scale-110 active:scale-95";
    const tabButtonBase = "px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200";
    const activeTabClass = "border-blue-600 text-blue-600";
    const inactiveTabClass = "border-transparent text-gray-500 hover:text-gray-800";

    return (
        <div className="flex flex-col bg-white rounded-lg shadow-sm h-full border border-gray-200" data-editor-theme={editorTheme}>
            <div className="flex items-center justify-between pl-2 bg-gray-50 text-gray-800 rounded-t-lg border-b border-gray-200">
                <div className="flex items-center">
                    <button onClick={() => setActiveTab('html')} className={`${tabButtonBase} ${activeTab === 'html' ? activeTabClass : inactiveTabClass}`}>Live Code (HTML)</button>
                    <button onClick={() => setActiveTab('css')} className={`${tabButtonBase} ${activeTab === 'css' ? activeTabClass : inactiveTabClass}`}>Custom CSS</button>
                </div>
                <div className="flex items-center gap-2 p-2">
                    <ThemeSelector selectedTheme={editorTheme} onThemeChange={setEditorTheme} />
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={onUndo} disabled={!canUndo || isLoading} className={iconButtonClasses} title="Undo">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.5 8C9.85 8 7.45 8.99 5.6 10.6L2 7V16H11L7.38 12.38C8.77 11.22 10.54 10.5 12.5 10.5C16.04 10.5 19.05 12.81 20.1 16L22.47 15.22C20.92 11.24 17.01 8 12.5 8Z"/></svg>
                    </button>
                    <button onClick={onRedo} disabled={!canRedo || isLoading} className={iconButtonClasses} title="Redo">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8C6.99 8 3.08 11.24 1.53 15.22L3.9 16C4.95 12.81 7.96 10.5 11.5 10.5C13.46 10.5 15.23 11.22 16.62 12.38L13 16H22V7L18.4 10.6Z"/></svg>
                    </button>
                    <button onClick={onSaveProject} disabled={isLoading} className={iconButtonClasses} title="Save Project">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17,3H5C3.89,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V7L17,3M19,19H5V5H16.17L19,7.83V19M12,12C10.34,12 9,13.34 9,15C9,16.66 10.34,18 12,18C13.66,18 15,16.66 15,15C15,13.34 13.66,12 12,12M6,6H15V10H6V6Z"/></svg>
                    </button>
                    <button onClick={onRefactorClick} disabled={isLoading} className={iconButtonClasses} title="AI Refactor">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A3,3 0 0,0 9,5C9,6.18 9.65,7.22 10.59,7.72L5.64,12.67L5.96,13L11,7.97V7.97C11.53,8.61 12.44,9 13.5,9C15.43,9 17,7.43 17,5.5C17,3.57 15.43,2 13.5,2M12,4A1,1 0 0,1 11,5A1,1 0 0,1 10,4A1,1 0 0,1 11,3A1,1 0 0,1 12,4M13.5,4C14.33,4 15,4.67 15,5.5C15,6.33 14.33,7 13.5,7C12.67,7 12,6.33 12,5.5C12,4.67 12.67,4 13.5,4M19.12,9.33L18.44,8.65L14.2,12.89L13.5,12.18L13.18,12.5L13.88,13.2L9.29,17.79L2,21L6.21,14.71L10.8,10.12L11.5,10.82L11.82,10.5L11.11,9.79L15.35,5.56L14.67,4.88L15.73,3.82L20.18,8.27L19.12,9.33Z" /></svg>
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={onRegenerate} disabled={isLoading} className={iconButtonClasses} title="Regenerate">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" /></svg>
                    </button>
                    <button onClick={handleCopy} className={iconButtonClasses} title="Copy Code">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" /></svg>
                    </button>
                    <button onClick={handleDownload} className={iconButtonClasses} title="Download Code">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" /></svg>
                    </button>
                </div>
            </div>
            <div className="flex-1 p-2 overflow-auto">
                {activeTab === 'html' ? (
                    <CodeDisplay editorRef={htmlEditorRef} code={code} onCodeChange={onCodeChange} />
                ) : (
                    <CustomCssInput editorRef={cssEditorRef} value={customCss} onChange={onCustomCssChange} />
                )}
            </div>
        </div>
    );
};