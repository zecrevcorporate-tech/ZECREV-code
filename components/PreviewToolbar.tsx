import React from 'react';
import type { Device } from '../types';
import { ThemeChanger } from './ThemeChanger';
import { LivePreview } from './LivePreview';

interface PreviewToolbarProps {
    onApplyTheme: (theme: string) => void;
    isLoadingTheme: boolean;
    previewDevice: Device;
    setPreviewDevice: (device: Device) => void;
    onOpenInNewTab: () => void;
    onToggleFullscreen: () => void;
    isCustomizeMode: boolean;
    onToggleCustomize: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
    onApplyTheme,
    isLoadingTheme,
    previewDevice,
    setPreviewDevice,
    onOpenInNewTab,
    onToggleFullscreen,
    isCustomizeMode,
    onToggleCustomize,
}) => {
    return (
        <div className="flex items-center justify-between p-2 bg-white rounded-t-lg border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600">Live Preview</h2>
            <div className="flex-1 px-4">
                <ThemeChanger onApplyTheme={onApplyTheme} isLoading={isLoadingTheme} />
            </div>
            <div className="flex items-center gap-4">
                 <button 
                    onClick={onToggleCustomize} 
                    className={`p-2 rounded-md transition-all duration-150 ease-in-out hover:scale-110 active:scale-100 ${
                        isCustomizeMode ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                    }`} 
                    title="Toggle Customize Mode"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                    </svg>
                </button>
                <div className="w-px h-5 bg-gray-300"></div>
                <LivePreview 
                    device={previewDevice} 
                    setDevice={setPreviewDevice}
                />
                <div className="w-px h-5 bg-gray-300"></div>
                <button 
                    onClick={onToggleFullscreen} 
                    className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-all duration-150 ease-in-out hover:scale-110 active:scale-100" 
                    title="Toggle Fullscreen"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1v4m0 0h-4m4 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 1v-4m0 0h-4m4 0l-5 5" />
                    </svg>
                </button>
                <button 
                    onClick={onOpenInNewTab} 
                    className="p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-all duration-150 ease-in-out hover:scale-110 active:scale-100" 
                    title="Open in New Tab"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </button>
            </div>
        </div>
    );
};