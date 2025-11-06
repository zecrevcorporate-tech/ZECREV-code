import React from 'react';

interface CodeDisplayProps {
    code: string;
    onCodeChange: (newCode: string) => void;
    editorRef: React.RefObject<HTMLTextAreaElement>;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, onCodeChange, editorRef }) => {
    return (
        <textarea
            ref={editorRef}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            className="code-editor themed-editor w-full h-full text-sm resize-none border-none focus:outline-none"
            spellCheck="false"
        />
    );
};