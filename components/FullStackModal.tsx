import React, { useState, useMemo } from 'react';
import { generateFullStackProjectStream } from '../services/geminiService';
import type { BackendTech, LoadingAction } from '../types';

declare const JSZip: any;

interface FullStackModalProps {
    onClose: () => void;
    setLoadingAction: (action: LoadingAction) => void;
}

interface ParsedResult {
    instructions: string;
    files: { name: string; lang: string; code: string }[];
}

// Simple markdown parser for this specific format
const parseFullStackResponse = (markdown: string): ParsedResult => {
    const instructionsMatch = markdown.match(/### Setup Instructions([\s\S]*?)###/);
    const instructions = instructionsMatch ? instructionsMatch[1].trim() : 'Could not parse instructions.';

    const files = [];
    const fileRegex = /### `(.*?)`\s*```(\w+)\s*([\s\S]*?)```/g;
    let match;
    while ((match = fileRegex.exec(markdown)) !== null) {
        files.push({
            name: match[1].trim(),
            lang: match[2].trim(),
            code: match[3].trim(),
        });
    }

    return { instructions, files };
};


export const FullStackModal: React.FC<FullStackModalProps> = ({ onClose, setLoadingAction }) => {
    const [idea, setIdea] = useState('');
    const [backendTech, setBackendTech] = useState<BackendTech>('nodejs-express');
    const [generatedMarkdown, setGeneratedMarkdown] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedFile, setCopiedFile] = useState<string | null>(null);

    const parsedResult = useMemo(() => {
        if (!generatedMarkdown) return null;
        return parseFullStackResponse(generatedMarkdown);
    }, [generatedMarkdown]);

    const handleGenerate = async () => {
        if (!idea.trim()) return;
        setIsLoading(true);
        setError('');
        setGeneratedMarkdown('');
        setLoadingAction('full-stack');
        try {
            let accumulatedResponse = '';
            for await (const chunk of generateFullStackProjectStream(idea, backendTech)) {
                accumulatedResponse += chunk;
                setGeneratedMarkdown(accumulatedResponse);
            }
        } catch (e) {
            setError('Failed to generate project. Please try again.');
        } finally {
            setIsLoading(false);
            setLoadingAction(null);
        }
    };

    const handleCopy = (fileName: string, code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedFile(fileName);
        setTimeout(() => setCopiedFile(null), 2000);
    };

    const handlePreview = (htmlCode: string) => {
        try {
            const blob = new Blob([htmlCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (e) {
            setError("Could not open preview window.");
            console.error(e);
        }
    };

    const handleDownloadZip = () => {
        if (!parsedResult || typeof JSZip === 'undefined') {
            setError("Could not download project. JSZip library not found.");
            return;
        }
        const zip = new JSZip();
        parsedResult.files.forEach(file => {
            zip.file(file.name, file.code);
        });
        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = "zecrev-codez-project.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full h-5/6 text-gray-800 border border-gray-200 relative transform transition-all flex flex-col" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex-shrink-0">
                    <h2 className="text-2xl font-bold text-blue-600 mb-2 text-center">Generate Full-Stack Project</h2>
                    <p className="text-gray-500 mb-4 text-center">Describe your web application, and the AI will generate the front-end, back-end, and setup instructions.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-4 flex-shrink-0">
                    <textarea
                        value={idea}
                        onChange={(e) => setIdea(e.target.value)}
                        placeholder="e.g., A simple to-do list app with a database connection"
                        className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                        rows={2}
                        disabled={isLoading}
                    />
                    <div className="flex gap-2 items-center">
                        <select
                            value={backendTech}
                            onChange={(e) => setBackendTech(e.target.value as BackendTech)}
                            className="p-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition h-full"
                            disabled={isLoading}
                        >
                            <option value="nodejs-express">Node.js + Express</option>
                        </select>
                        <button onClick={handleGenerate} disabled={isLoading || !idea.trim()} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center justify-center h-full">
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                
                <div className="flex-1 flex gap-4 overflow-hidden">
                    {isLoading && !generatedMarkdown && (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <p>AI is building your project...</p>
                        </div>
                    )}
                    {parsedResult && (
                        <>
                            <div className="w-1/3 flex flex-col">
                                <h3 className="font-semibold mb-2 flex-shrink-0">Setup Instructions</h3>
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-auto text-sm flex-1">
                                    <ol className="list-decimal list-inside space-y-2">
                                        {parsedResult.instructions.split('\n').filter(line => /^\d+\./.test(line.trim())).map((line, index) => (
                                            <li key={index}>{line.replace(/^\d+\.\s*/, '')}</li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                            <div className="w-2/3 flex flex-col">
                                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                                    <h3 className="font-semibold">Generated Files</h3>
                                    {parsedResult.files.length > 0 && (
                                        <button onClick={handleDownloadZip} className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                            Download ZIP
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4 overflow-auto flex-1">
                                    {parsedResult.files.map(file => (
                                        <div key={file.name} className="bg-gray-50 border border-gray-200 rounded-lg">
                                            <div className="flex justify-between items-center p-2 bg-gray-100 border-b border-gray-200">
                                                <code className="font-mono text-sm font-semibold">{file.name}</code>
                                                <div className="flex items-center gap-2">
                                                    {file.name === 'index.html' && (
                                                        <button onClick={() => handlePreview(file.code)} className="text-xs text-blue-600 font-semibold">Preview</button>
                                                    )}
                                                    <button onClick={() => handleCopy(file.name, file.code)} className="text-xs text-blue-600 font-semibold">
                                                        {copiedFile === file.name ? 'Copied!' : 'Copy'}
                                                    </button>
                                                </div>
                                            </div>
                                            <pre className="p-2 text-xs overflow-auto max-h-60"><code className={`language-${file.lang}`}>{file.code}</code></pre>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};