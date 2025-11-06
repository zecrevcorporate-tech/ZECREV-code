import React, { useState, useEffect } from 'react';
import type { SelectedElement } from '../types';

interface StyleEditorSidebarProps {
    element: SelectedElement;
    onClose: () => void;
    onStyleChange: (id: string, property: keyof SelectedElement['styles'] | 'textContent', value: string) => void;
}

// FIX: Export the StyleEditorSidebar component
export const StyleEditorSidebar: React.FC<StyleEditorSidebarProps> = ({ element, onClose, onStyleChange }) => {
    const [textContent, setTextContent] = useState(element.textContent);
    const [backgroundColor, setBackgroundColor] = useState(element.styles.backgroundColor);
    const [color, setColor] = useState(element.styles.color);
    const [padding, setPadding] = useState(element.styles.padding);
    const [margin, setMargin] = useState(element.styles.margin);

    useEffect(() => {
        setTextContent(element.textContent);
        setBackgroundColor(element.styles.backgroundColor);
        setColor(element.styles.color);
        setPadding(element.styles.padding);
        setMargin(element.styles.margin);
    }, [element]);

    const handleStyleChange = (property: keyof SelectedElement['styles'] | 'textContent', value: string) => {
        onStyleChange(element.id, property, value);
    };
    
    const handleDebouncedChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, property: keyof SelectedElement['styles'] | 'textContent') => {
        const newValue = e.target.value;
        if (property === 'textContent') setTextContent(newValue);
        if (property === 'padding') setPadding(newValue);
        if (property === 'margin') setMargin(newValue);
        
        // Basic debounce
        const handler = setTimeout(() => {
            handleStyleChange(property, newValue);
        }, 300);
        return () => clearTimeout(handler);
    }

    return (
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white border-l border-gray-200 shadow-lg z-10 flex flex-col p-4 text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-4">
                <h3 className="font-semibold text-gray-700">Style Editor</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div className="flex-1 space-y-4 overflow-y-auto">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tag</label>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono">{element.tagName.toLowerCase()}</span>
                </div>
                <div>
                    <label htmlFor="textContent" className="block text-xs font-medium text-gray-500 mb-1">Text Content</label>
                    <textarea
                        id="textContent"
                        value={textContent}
                        onChange={(e) => handleDebouncedChange(e, 'textContent')}
                        className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 transition text-xs"
                        rows={4}
                    />
                </div>
                 <div>
                    <label htmlFor="bgColor" className="block text-xs font-medium text-gray-500 mb-1">Background</label>
                    <div className="flex items-center gap-2">
                        <input
                            id="bgColor"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => {
                                setBackgroundColor(e.target.value);
                                handleStyleChange('backgroundColor', e.target.value);
                            }}
                            className="w-8 h-8 p-0 border-none rounded cursor-pointer"
                        />
                         <span className="text-gray-600 font-mono text-xs">{backgroundColor}</span>
                    </div>
                </div>
                 <div>
                    <label htmlFor="textColor" className="block text-xs font-medium text-gray-500 mb-1">Text Color</label>
                    <div className="flex items-center gap-2">
                         <input
                            id="textColor"
                            type="color"
                            value={color}
                            onChange={(e) => {
                                setColor(e.target.value);
                                handleStyleChange('color', e.target.value);
                            }}
                            className="w-8 h-8 p-0 border-none rounded cursor-pointer"
                        />
                        <span className="text-gray-600 font-mono text-xs">{color}</span>
                    </div>
                </div>

                <div>
                    <label htmlFor="padding" className="block text-xs font-medium text-gray-500 mb-1">Padding</label>
                    <input
                        id="padding"
                        type="text"
                        value={padding}
                        onChange={(e) => handleDebouncedChange(e, 'padding')}
                        className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 transition text-xs font-mono"
                        placeholder="e.g., 1rem or 16px"
                    />
                </div>
                 <div>
                    <label htmlFor="margin" className="block text-xs font-medium text-gray-500 mb-1">Margin</label>
                    <input
                        id="margin"
                        type="text"
                        value={margin}
                        onChange={(e) => handleDebouncedChange(e, 'margin')}
                        className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 transition text-xs font-mono"
                        placeholder="e.g., 1rem or 16px"
                    />
                </div>
            </div>
        </div>
    );
};