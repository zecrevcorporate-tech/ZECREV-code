import React from 'react';

interface CustomCssInputProps {
    value: string;
    onChange: (css: string) => void;
    editorRef: React.RefObject<HTMLTextAreaElement>;
}

export const CustomCssInput: React.FC<CustomCssInputProps> = ({ value, onChange, editorRef }) => {
    return (
        <textarea
            ref={editorRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/* Your custom CSS rules go here */"
            className="code-editor themed-editor w-full h-full text-sm resize-none border-none focus:outline-none"
            spellCheck="false"
        />
    );
};