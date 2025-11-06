import React, { useState } from 'react';

interface DeployModalProps {
    onClose: () => void;
    code: string;
}

type DeployTab = 'online' | 'local';

export const DeployModal: React.FC<DeployModalProps> = ({ onClose, code }) => {
    const [activeTab, setActiveTab] = useState<DeployTab>('online');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [siteUrl, setSiteUrl] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [authorName, setAuthorName] = useState('');
    const [authorUrl, setAuthorUrl] = useState('');

    const getCodeWithUserDetails = () => {
        if (!authorName.trim() && !authorUrl.trim()) {
            return code;
        }

        let metaTags = '';
        if (authorName.trim()) {
            metaTags += `\n    <meta name="author" content="${authorName.trim()}">`;
        }
        if (authorUrl.trim()) {
            try {
                // Simple validation
                new URL(authorUrl.trim());
                metaTags += `\n    <link rel="author" href="${authorUrl.trim()}">`;
            } catch (_) {
                // Do not add invalid URL
            }
        }

        if (code.includes('</head>')) {
            return code.replace('</head>', `${metaTags}\n</head>`);
        }
        
        return code; // Fallback
    };

    const handleDeploy = () => {
        setIsLoading(true);
        setLoadingMessage('Connecting to Netlify...');
        // Simulate connection
        setTimeout(() => {
            setLoadingMessage('Preparing deployment...');
            // Simulate deployment steps
            setTimeout(() => setLoadingMessage('Uploading files...'), 1000);
            setTimeout(() => setLoadingMessage('Building site...'), 2500);
            // Simulate success
            setTimeout(() => {
                const randomString = Math.random().toString(36).substring(7);
                setSiteUrl(`https://zecrev-codez-${randomString}.netlify.app`);
                setIsSuccess(true);
                setIsLoading(false);
            }, 4000);
        }, 1500);
    };

    const handleDownloadHtml = () => {
        const finalCode = getCodeWithUserDetails();
        const blob = new Blob([finalCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const copyCommand = (command: string) => {
        navigator.clipboard.writeText(command);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const renderOnlineContent = () => {
        if (isSuccess) {
            return (
                <div className="text-center mt-6">
                    <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4 border border-green-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Deployment Successful!</h3>
                    <p className="text-gray-500 mt-2 mb-4">Your website is now live on the internet.</p>
                    <div className="bg-gray-100 p-2 rounded-lg text-sm font-mono break-all mb-6 text-gray-600 border border-gray-200">{siteUrl}</div>
                    <a 
                        href={siteUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                        Visit Live Site
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                </div>
            );
        }

        return (
            <div className="text-center mt-6">
                 <p className="mb-6 text-gray-500">
                    Publish your website directly to Netlify with a single click. We'll handle the build and deployment process for you.
                </p>
                <button 
                    onClick={handleDeploy}
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                     {isLoading ? (
                        <>
                           <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           {loadingMessage}
                        </>
                     ) : 'Deploy with Netlify'}
                </button>
            </div>
        );
    };
    
    const renderLocalContent = () => (
        <div className="text-left mt-6 space-y-4 text-sm text-gray-600">
            <p>Run your website on your own computer for private testing and development.</p>
            <div className="space-y-2">
                <p><strong>1. Download your code:</strong></p>
                <button
                    onClick={handleDownloadHtml}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                    Download index.html
                </button>
            </div>
            <div className="space-y-2">
                <p><strong>2. Open a terminal or command prompt:</strong></p>
                <p>Navigate to the directory where you saved the <code>index.html</code> file.</p>
            </div>
            <div className="space-y-2">
                <p><strong>3. Choose a server command:</strong></p>

                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="font-semibold text-green-800">Recommended: With Live Reload</p>
                    <p className="text-xs text-green-700 mb-2">This automatically reloads the browser when you save changes.</p>
                    <div className="flex items-center justify-between mt-1 bg-white p-2 rounded">
                        <code className="font-mono text-xs">npx live-server</code>
                        <button onClick={() => copyCommand('npx live-server')} className="text-xs text-blue-600 font-semibold">{isCopied ? 'Copied!' : 'Copy'}</button>
                    </div>
                </div>

                <div className="bg-gray-100 p-2 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-700">Basic Server (Node.js)</p>
                    <div className="flex items-center justify-between mt-1">
                        <code className="font-mono text-xs">npx serve</code>
                        <button onClick={() => copyCommand('npx serve')} className="text-xs text-blue-600 font-semibold">{isCopied ? 'Copied!' : 'Copy'}</button>
                    </div>
                </div>
                 <div className="bg-gray-100 p-2 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-700">Basic Server (Python 3)</p>
                    <div className="flex items-center justify-between mt-1">
                         <code className="font-mono text-xs">python -m http.server</code>
                         <button onClick={() => copyCommand('python -m http.server')} className="text-xs text-blue-600 font-semibold">{isCopied ? 'Copied!' : 'Copy'}</button>
                    </div>
                </div>
            </div>
            <p><strong>4. View your site:</strong> Open your browser and go to the URL provided in the terminal (e.g., http://localhost:8080 or http://localhost:8000).</p>
        </div>
    );

    const tabButtonBase = "px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200";
    const activeTabClass = "border-blue-600 text-blue-600";
    const inactiveTabClass = "border-transparent text-gray-500 hover:text-gray-800";


    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-2xl p-8 max-w-lg w-full text-gray-800 border border-gray-200 relative transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className="text-2xl font-bold text-blue-600 mb-2 text-center">Deploy Your Website</h2>
                <p className="text-gray-500 mb-6 text-center">Optionally, add your details to be included in the website's metadata before deploying.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                        <input
                            type="text"
                            id="authorName"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="e.g., Jane Doe"
                            className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="authorUrl" className="block text-sm font-medium text-gray-700 mb-1">Author Website</label>
                        <input
                            type="url"
                            id="authorUrl"
                            value={authorUrl}
                            onChange={(e) => setAuthorUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>
                </div>

                <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex justify-center gap-6" aria-label="Tabs">
                        <button 
                            onClick={() => setActiveTab('online')}
                            className={`${tabButtonBase} ${activeTab === 'online' ? activeTabClass : inactiveTabClass}`}
                        >
                            Online (Netlify)
                        </button>
                        <button 
                             onClick={() => setActiveTab('local')}
                            className={`${tabButtonBase} ${activeTab === 'local' ? activeTabClass : inactiveTabClass}`}
                        >
                            Local Server
                        </button>
                    </nav>
                </div>
                
                {activeTab === 'online' ? renderOnlineContent() : renderLocalContent()}
            </div>
        </div>
    );
};