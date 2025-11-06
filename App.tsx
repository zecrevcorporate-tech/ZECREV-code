import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { PromptForm } from './components/PromptForm';
import { ChatBox } from './components/ChatBox';
import { generateCode, startChat, continueChat } from './services/geminiService';
import type { HistoryItem, ChatMessage, Device, EditorTab, EditorTheme, SelectedElement } from './types';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { DeployModal } from './components/DeployModal';
import { EditorTabs } from './components/EditorTabs';
import { PreviewToolbar } from './components/PreviewToolbar';
import { IdeaModal } from './components/IdeaModal';
import { RoadmapModal } from './components/RoadmapModal';
import { ImageModal } from './components/ImageModal';
import { StyleEditorSidebar } from './components/StyleEditorSidebar';
import { RefactorModal } from './components/RefactorModal';
import { FullStackModal } from './components/FullStackModal';
import { LoginScreen } from './components/LoginScreen';

const DEVICE_DIMENSIONS = {
    desktop: { width: '100%', height: '100%' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '812px' },
};

const App: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [loadingAction, setLoadingAction] = useState<'generate' | 'clone' | 'chat' | 'theme' | 'image-to-code' | 'idea-to-image' | 'style' | 'refactor' | 'full-stack' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [customCss, setCustomCss] = useState<string>('');
    const [isDeployModalVisible, setIsDeployModalVisible] = useState<boolean>(false);
    const [activeEditorTab, setActiveEditorTab] = useState<EditorTab>('html');
    const [editorTheme, setEditorTheme] = useState<EditorTheme>('light');
    const htmlEditorRef = useRef<HTMLTextAreaElement>(null);
    const cssEditorRef = useRef<HTMLTextAreaElement>(null);

    // State for Preview
    const [previewDevice, setPreviewDevice] = useState<Device>('desktop');
    const [previewSize, setPreviewSize] = useState<{width: string; height: string}>(DEVICE_DIMENSIONS.desktop);
    const [isPreviewFullscreen, setIsPreviewFullscreen] = useState<boolean>(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // State for drag-to-scroll
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0, scrollTop: 0, scrollLeft: 0 });

    // State for Undo/Redo
    const [codeHistory, setCodeHistory] = useState<string[]>([]);
    const [currentCodeHistoryIndex, setCurrentCodeHistoryIndex] = useState<number>(-1);
    
    // State for resizable panes
    const [isResizing, setIsResizing] = useState(false);
    const [leftPaneWidth, setLeftPaneWidth] = useState(50); // percentage

    // State for new modals
    const [isIdeaModalVisible, setIsIdeaModalVisible] = useState<boolean>(false);
    const [isRoadmapModalVisible, setIsRoadmapModalVisible] = useState<boolean>(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState<boolean>(false);
    const [isFullStackModalVisible, setIsFullStackModalVisible] = useState(false);
    
    // State for Customize Mode / Visual Editor
    const [isCustomizeMode, setIsCustomizeMode] = useState(false);
    const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);

    // State for AI Refactor
    const [isRefactorModalVisible, setIsRefactorModalVisible] = useState(false);
    const [selectedCodeSnippet, setSelectedCodeSnippet] = useState<{
        text: string;
        start: number;
        end: number;
        editor: 'html' | 'css';
    } | null>(null);
    
    // State for login
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    const debounceTimeoutRef = useRef<number | null>(null);
    const isLoading = loadingAction !== null;

    useEffect(() => {
        const savedHistory = localStorage.getItem('zecrev-codez-history');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    useEffect(() => {
        setPreviewSize(DEVICE_DIMENSIONS[previewDevice]);
    }, [previewDevice]);

     const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;
        const newLeftWidth = (e.clientX / window.innerWidth) * 100;
        if (newLeftWidth > 20 && newLeftWidth < 80) { // Constraints
            setLeftPaneWidth(newLeftWidth);
        }
    }, [isResizing]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // Element Inspector & Customizer Logic
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframeRef.current?.contentWindow) return;

            if (event.data.type === 'INSPECT_ELEMENT_STYLE') {
                setSelectedElement(event.data.payload);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    useEffect(() => {
        iframeRef.current?.contentWindow?.postMessage({ type: 'SET_CUSTOMIZE_MODE', payload: isCustomizeMode }, '*');
        if (!isCustomizeMode) {
            setSelectedElement(null); // Clear selection when exiting customize mode
        }
    }, [isCustomizeMode]);

    const handleStyleChange = useCallback((id: string, property: keyof SelectedElement['styles'] | 'textContent', value: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(generatedCode, 'text/html');
        const element = doc.querySelector(`[data-zecrev-id="${id}"]`) as HTMLElement;

        if (element) {
            if (property === 'textContent') {
                // To avoid breaking child elements, only change the first text node
                const textNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                if (textNode) {
                    textNode.textContent = value;
                } else {
                    element.prepend(document.createTextNode(value));
                }
            } else {
                element.style[property] = value;
            }

            const newHtml = doc.documentElement.outerHTML;
            setGeneratedCode(newHtml);
            // Debounced history update for styles
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = window.setTimeout(() => {
                const newCodeHistory = [...codeHistory.slice(0, currentCodeHistoryIndex + 1), newHtml];
                setCodeHistory(newCodeHistory);
                setCurrentCodeHistoryIndex(newCodeHistory.length - 1);
            }, 500);
        }
    }, [generatedCode, codeHistory, currentCodeHistoryIndex]);


    const updateHistory = (newHistory: HistoryItem[]) => {
        setHistory(newHistory);
        localStorage.setItem('zecrev-codez-history', JSON.stringify(newHistory));
    };

    const handleNewProject = () => {
        setPrompt('');
        setGeneratedCode('');
        setLoadingAction(null);
        setError(null);
        setChatSession(null);
        setChatMessages([]);
        setCustomCss('');
        setCodeHistory([]);
        setCurrentCodeHistoryIndex(-1);
        setActiveEditorTab('html');
        setIsCustomizeMode(false);
        setSelectedElement(null);
    };

    const handleGenerate = useCallback(async (submission: string) => {
        if (!submission || loadingAction) return;

        let userPromptForHistory = submission;
        let promptForAI = submission;
        let action: 'generate' | 'clone' = 'generate';

        if (submission.startsWith('clone:')) {
            action = 'clone';
            const url = submission.substring(6);
            userPromptForHistory = `Cloned URL: ${url}`;
            promptForAI = `Your task is to create a high-fidelity clone of the website at the following URL: ${url}. Replicate the visual layout, color scheme, typography, text content, and overall structure as accurately as possible. The final output must be a single, complete HTML file. All styling must be implemented using Tailwind CSS classes directly in the HTML elements. All necessary JavaScript for interactivity should be included in a script tag at the end of the body. The entire website clone must be self-contained in one HTML file, using the Tailwind CDN.`;
            setPrompt(''); // Clear the main prompt input after URL analysis
        } else {
            setPrompt(submission); // Sync prompt state for text-based generations
        }

        setLoadingAction(action);
        setError(null);
        setGeneratedCode('');
        setChatMessages([]);
        setCustomCss('');
        setActiveEditorTab('html');
        setSelectedElement(null);
        setIsCustomizeMode(false);

        try {
            let accumulatedCode = '';
            for await (const chunk of generateCode(promptForAI)) {
                accumulatedCode += chunk;
                setGeneratedCode(accumulatedCode);
            }

            const finalCode = accumulatedCode.trim().replace(/```html|```/g, '').trim();
            setGeneratedCode(finalCode); // Set final cleaned code one last time

            const newCodeHistory = [finalCode];
            setCodeHistory(newCodeHistory);
            setCurrentCodeHistoryIndex(0);

            const newHistoryItem: HistoryItem = { id: Date.now(), prompt: userPromptForHistory, code: finalCode };
            updateHistory([newHistoryItem, ...history]);
            
            const newChatSession = startChat();
            setChatSession(newChatSession);
            setChatMessages([{ role: 'user', text: userPromptForHistory }, { role: 'model', text: 'Here is the code I generated. How can I help you improve it?' }]);

        } catch (e) {
            setError('Failed to generate code. Please try again.');
            console.error(e);
        } finally {
            setLoadingAction(null);
        }
    }, [loadingAction, history]);

    const handleGenerateFromImage = useCallback(async (imageData: { mimeType: string; data: string }, source: string) => {
        if (!imageData || loadingAction) return;

        const userPromptForHistory = `Generated from an image (${source})`;

        setLoadingAction('image-to-code');
        setError(null);
        setGeneratedCode('');
        setChatMessages([]);
        setCustomCss('');
        setActiveEditorTab('html');
        setSelectedElement(null);
        setIsCustomizeMode(false);


        try {
            let accumulatedCode = '';
            const { generateCodeFromImageStream } = await import('./services/geminiService');
            const prompt = "Analyze this image which is a wireframe or mockup of a website. Convert it into a single, complete HTML file using Tailwind CSS for styling. The code should be clean, responsive, and accurately reflect the layout, components, and text visible in the image. IMPORTANT: Do not invent any new sections or content that is not present in the image. Generate only what you see.";
            for await (const chunk of generateCodeFromImageStream(prompt, imageData)) {
                accumulatedCode += chunk;
                setGeneratedCode(accumulatedCode);
            }

            const finalCode = accumulatedCode.trim().replace(/```html|```/g, '').trim();
            setGeneratedCode(finalCode);

            const newCodeHistory = [finalCode];
            setCodeHistory(newCodeHistory);
            setCurrentCodeHistoryIndex(0);

            const newHistoryItem: HistoryItem = { id: Date.now(), prompt: userPromptForHistory, code: finalCode };
            updateHistory([newHistoryItem, ...history]);
            
            const newChatSession = startChat();
            setChatSession(newChatSession);
            setChatMessages([{ role: 'user', text: userPromptForHistory }, { role: 'model', text: 'Here is the code I generated from your image. How can I help you improve it?' }]);

        } catch (e) {
            setError('Failed to generate code from the image. Please try again.');
            console.error(e);
        } finally {
            setLoadingAction(null);
        }
    }, [loadingAction, history]);


    const handleRegenerate = useCallback(() => {
        if (prompt) {
            handleGenerate(prompt);
        }
    }, [prompt, handleGenerate]);

    const handleHistorySelect = (item: HistoryItem) => {
        setPrompt(item.prompt.startsWith('Cloned URL:') || item.prompt.startsWith('(Saved)') ? '' : item.prompt);
        setGeneratedCode(item.code);
        setCodeHistory([item.code]);
        setCurrentCodeHistoryIndex(0);
        setChatSession(null);
        setChatMessages([]);
        setCustomCss('');
        setActiveEditorTab('html');
        setSelectedElement(null);
        setIsCustomizeMode(false);
    };

    const handleClearHistory = () => {
        updateHistory([]);
    };

    const handleChatSubmit = useCallback(async (message: string) => {
        if (!chatSession || !message || loadingAction) return;
        
        setLoadingAction('chat');
        setError(null);
        const updatedMessages: ChatMessage[] = [...chatMessages, { role: 'user', text: message }];
        setChatMessages(updatedMessages);

        try {
            const fullPrompt = `Based on the previous code, please apply this change: "${message}". Return the complete, updated HTML file.`;
            
            let accumulatedCode = '';
            for await (const chunk of continueChat(chatSession, fullPrompt)) {
                accumulatedCode += chunk;
                setGeneratedCode(accumulatedCode);
            }
            const finalCode = accumulatedCode.trim().replace(/```html|```/g, '').trim();
            setGeneratedCode(finalCode);

            const newCodeHistory = [...codeHistory.slice(0, currentCodeHistoryIndex + 1), finalCode];
            setCodeHistory(newCodeHistory);
            setCurrentCodeHistoryIndex(newCodeHistory.length - 1);

            setChatMessages([...updatedMessages, { role: 'model', text: 'Here are the requested changes.' }]);
            
            const latestHistoryItem = history[0];
            if (latestHistoryItem) {
                const updatedHistory = [{...latestHistoryItem, code: finalCode}, ...history.slice(1)];
                updateHistory(updatedHistory);
            }

        } catch (e) {
            setError('Failed to get response from chat. Please try again.');
            console.error(e);
            setChatMessages(updatedMessages);
        } finally {
            setLoadingAction(null);
        }
    }, [chatSession, chatMessages, history, codeHistory, currentCodeHistoryIndex, loadingAction]);
    
    const handleThemeChange = useCallback(async (themePrompt: string) => {
        if (!chatSession || !themePrompt || loadingAction) return;

        setLoadingAction('theme');
        setError(null);
        try {
            const fullPrompt = `Based on the current code, please apply a new theme: "${themePrompt}". IMPORTANT: Do not change the existing HTML structure, layout, or text content. Only update the Tailwind CSS classes to reflect the new theme. Return the complete, updated HTML file.`;
            
            let accumulatedCode = '';
            for await (const chunk of continueChat(chatSession, fullPrompt)) {
                accumulatedCode += chunk;
                setGeneratedCode(accumulatedCode);
            }
            const finalCode = accumulatedCode.trim().replace(/```html|```/g, '').trim();
            setGeneratedCode(finalCode);

            const newCodeHistory = [...codeHistory.slice(0, currentCodeHistoryIndex + 1), finalCode];
            setCodeHistory(newCodeHistory);
            setCurrentCodeHistoryIndex(newCodeHistory.length - 1);

        } catch (e) {
            setError('Failed to apply new theme. Please try again.');
            console.error(e);
        } finally {
            setLoadingAction(null);
        }
    }, [chatSession, codeHistory, currentCodeHistoryIndex, loadingAction]);

    const handleSaveProject = useCallback(() => {
        if (!generatedCode) return;

        const newCodeHistory = [...codeHistory.slice(0, currentCodeHistoryIndex + 1), generatedCode];
        setCodeHistory(newCodeHistory);
        setCurrentCodeHistoryIndex(newCodeHistory.length - 1);

        if (history.length > 0) {
            const latestHistoryItem = history[0];
            const updatedHistoryItem: HistoryItem = { 
                ...latestHistoryItem, 
                code: generatedCode,
                prompt: latestHistoryItem.prompt.startsWith('(Saved)') 
                    ? latestHistoryItem.prompt 
                    : `(Saved) ${latestHistoryItem.prompt}`
            };
            updateHistory([updatedHistoryItem, ...history.slice(1)]);
        } else {
            const newHistoryItem: HistoryItem = { 
                id: Date.now(), 
                prompt: 'Manually Saved Code', 
                code: generatedCode 
            };
            updateHistory([newHistoryItem]);
        }
    }, [generatedCode, history, updateHistory, codeHistory, currentCodeHistoryIndex]);


    const handleCodeChange = (newCode: string) => {
        setGeneratedCode(newCode);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = window.setTimeout(() => {
            const newCodeHistory = [...codeHistory.slice(0, currentCodeHistoryIndex + 1), newCode];
            setCodeHistory(newCodeHistory);
            setCurrentCodeHistoryIndex(newCodeHistory.length - 1);
        }, 500); // 500ms debounce
    };

    const handleUndo = useCallback(() => {
        if (currentCodeHistoryIndex > 0) {
            const newIndex = currentCodeHistoryIndex - 1;
            setCurrentCodeHistoryIndex(newIndex);
            setGeneratedCode(codeHistory[newIndex]);
        }
    }, [currentCodeHistoryIndex, codeHistory]);

    const handleRedo = useCallback(() => {
        if (currentCodeHistoryIndex < codeHistory.length - 1) {
            const newIndex = currentCodeHistoryIndex + 1;
            setCurrentCodeHistoryIndex(newIndex);
            setGeneratedCode(codeHistory[newIndex]);
        }
    }, [currentCodeHistoryIndex, codeHistory]);
    
    const handleOpenRefactorModal = () => {
        const editorRef = activeEditorTab === 'html' ? htmlEditorRef : cssEditorRef;
        const editor = editorRef.current;
        if (!editor) return;

        const { selectionStart, selectionEnd, value } = editor;
        if (selectionStart === selectionEnd) {
            // Silently ignore if nothing is selected
            return; 
        }

        const selectedText = value.substring(selectionStart, selectionEnd);
        setSelectedCodeSnippet({
            text: selectedText,
            start: selectionStart,
            end: selectionEnd,
            editor: activeEditorTab
        });
        setIsRefactorModalVisible(true);
    };

    const handlePerformRefactor = async (action: string) => {
        if (!selectedCodeSnippet) return;

        setLoadingAction('refactor');
        setIsRefactorModalVisible(false);
        setError(null);

        try {
            const { refactorCodeStream } = await import('./services/geminiService');
            let accumulatedResponse = '';
            for await (const chunk of refactorCodeStream(selectedCodeSnippet.text, action)) {
                accumulatedResponse += chunk;
            }
            const refactoredSnippet = accumulatedResponse.trim();

            const currentCode = selectedCodeSnippet.editor === 'html' ? generatedCode : customCss;
            const newCode = 
                currentCode.substring(0, selectedCodeSnippet.start) +
                refactoredSnippet +
                currentCode.substring(selectedCodeSnippet.end);

            if (selectedCodeSnippet.editor === 'html') {
                setGeneratedCode(newCode);
                const newCodeHistory = [...codeHistory.slice(0, currentCodeHistoryIndex + 1), newCode];
                setCodeHistory(newCodeHistory);
                setCurrentCodeHistoryIndex(newCodeHistory.length - 1);
            } else {
                setCustomCss(newCode);
            }

        } catch (e) {
            setError('Failed to refactor code. Please try again.');
            console.error(e);
        } finally {
            setLoadingAction(null);
            setSelectedCodeSnippet(null);
        }
    };
    
    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };


    const inspectorScript = `
        <script>
            let customizeModeEnabled = false;
            let lastHoveredElement = null;

            // Use a timeout to ensure the DOM is ready for ID assignment
            setTimeout(() => {
                let idCounter = 0;
                document.querySelectorAll('body *').forEach(el => {
                    if (!el.hasAttribute('data-zecrev-id')) {
                        el.setAttribute('data-zecrev-id', 'zecrev-' + idCounter++);
                    }
                });
            }, 50);

            window.addEventListener('message', (event) => {
                if (event.data.type === 'SET_CUSTOMIZE_MODE') {
                    customizeModeEnabled = event.data.payload;
                    if (!customizeModeEnabled && lastHoveredElement) {
                        lastHoveredElement.style.outline = '';
                    }
                }
            });

            function debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }

            const handleMouseOver = (e) => {
                if (!customizeModeEnabled) return;
                if (lastHoveredElement) {
                    lastHoveredElement.style.outline = '';
                }
                const target = e.target;
                if (target && target.style) {
                   target.style.outline = '2px solid #2563eb'; // blue-600
                   target.style.outlineOffset = '-2px';
                   lastHoveredElement = target;
                }
            };

            const handleMouseOut = (e) => {
                if (!customizeModeEnabled) return;
                const target = e.target;
                if (target && target.style) {
                   target.style.outline = '';
                }
            };

            const handleClick = (e) => {
                if (!customizeModeEnabled) return;
                e.preventDefault();
                e.stopPropagation();
                const target = e.target;
                const style = window.getComputedStyle(target);
                const firstTextNode = Array.from(target.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                
                window.parent.postMessage({ 
                    type: 'INSPECT_ELEMENT_STYLE',
                    payload: { 
                        id: target.getAttribute('data-zecrev-id'),
                        tagName: target.tagName,
                        textContent: firstTextNode ? firstTextNode.textContent.trim() : '',
                        styles: {
                            backgroundColor: style.backgroundColor,
                            color: style.color,
                            padding: style.padding,
                            margin: style.margin,
                        }
                    } 
                }, '*');
            };

            setTimeout(() => {
                if (document.body) {
                    document.body.addEventListener('mouseover', debounce(handleMouseOver, 50));
                    document.body.addEventListener('mouseout', handleMouseOut);
                    document.body.addEventListener('click', handleClick, true);
                }
            }, 100);
        </script>
    `;

    const displayCode = React.useMemo(() => {
        let codeWithCss = customCss
            ? generatedCode.replace('</head>', `<style>${customCss}</style></head>`)
            : generatedCode;
        
        if (codeWithCss.includes('</body>')) {
            return codeWithCss.replace('</body>', `${inspectorScript}</body>`);
        }
        return codeWithCss + inspectorScript;
    }, [generatedCode, customCss]);

    const handleOpenInNewTab = useCallback(() => {
        if (!displayCode) return;
        try {
            const blob = new Blob([displayCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error("Error opening in new tab:", error);
            setError("Could not open preview in a new tab.");
        }
    }, [displayCode]);
    
    const handleDeviceChange = useCallback((device: Device) => {
        setPreviewDevice(device);

        if (device === 'tablet' || device === 'mobile') {
            if (!displayCode) return;
            try {
                const { width, height } = DEVICE_DIMENSIONS[device];
                const features = `width=${parseInt(width)},height=${parseInt(height)},resizable=yes,scrollbars=yes`;
                
                const previewWindow = window.open('', `${device}_preview`, features);

                if (previewWindow) {
                    previewWindow.document.write('<!DOCTYPE html><html><head><title>Preview</title></head><body></body></html>');
                    previewWindow.document.write(displayCode);
                    previewWindow.document.close();
                    previewWindow.focus();
                } else {
                    setError("Popup blocked. Please allow popups for this site to use device previews.");
                }
            } catch (error) {
                console.error("Error opening device preview:", error);
                setError("Could not open device preview window.");
            }
        }
    }, [displayCode]);

    const handleToggleFullscreen = () => {
        setIsPreviewFullscreen(prevState => !prevState);
    };

    const handleUseGeneratedPrompt = (newPrompt: string) => {
        setPrompt(newPrompt);
    };

    const handleDragMouseDown = (e: React.MouseEvent) => {
        if (previewDevice === 'desktop' || !iframeRef.current) return;
        e.preventDefault();
        setIsDragging(true);
        setDragStartPos({
            x: e.clientX,
            y: e.clientY,
            scrollTop: iframeRef.current.contentWindow?.scrollY || 0,
            scrollLeft: iframeRef.current.contentWindow?.scrollX || 0,
        });
        iframeRef.current.style.pointerEvents = 'none';
    };

    const handleDragMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !iframeRef.current?.contentWindow) return;
        e.preventDefault();
        const dy = e.clientY - dragStartPos.y;
        iframeRef.current.contentWindow.scrollTo(dragStartPos.scrollLeft, dragStartPos.scrollTop - dy);
    };

    const handleDragMouseUp = (e: React.MouseEvent) => {
        if (previewDevice === 'desktop' || !iframeRef.current) return;
        e.preventDefault();
        setIsDragging(false);
        iframeRef.current.style.pointerEvents = 'auto';
    };

    const handleDragMouseLeave = (e: React.MouseEvent) => {
        if (isDragging) {
            handleDragMouseUp(e);
        }
    };

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-50 text-gray-900 font-sans">
            {isDeployModalVisible && <DeployModal onClose={() => setIsDeployModalVisible(false)} code={displayCode} />}
            {isIdeaModalVisible && <IdeaModal onClose={() => setIsIdeaModalVisible(false)} onUsePrompt={handleUseGeneratedPrompt} />}
            {isRoadmapModalVisible && <RoadmapModal onClose={() => setIsRoadmapModalVisible(false)} />}
            {isImageModalVisible && (
                <ImageModal 
                    onClose={() => setIsImageModalVisible(false)} 
                    onGenerate={handleGenerateFromImage}
                    setLoadingAction={setLoadingAction}
                    currentLoadingAction={loadingAction}
                />
            )}
            {isRefactorModalVisible && selectedCodeSnippet && (
                <RefactorModal 
                    onClose={() => setIsRefactorModalVisible(false)}
                    selectedCode={selectedCodeSnippet.text}
                    onRefactor={handlePerformRefactor}
                />
            )}
            {isFullStackModalVisible && (
                <FullStackModal
                    onClose={() => setIsFullStackModalVisible(false)}
                    setLoadingAction={setLoadingAction}
                />
            )}


            {isPreviewFullscreen && (
                <div className="fixed inset-0 z-50 bg-gray-100">
                    <iframe
                        srcDoc={displayCode}
                        title="Fullscreen Preview"
                        className="bg-white border-none w-full h-full"
                        sandbox="allow-scripts allow-modals allow-forms"
                    />
                    <button 
                        onClick={handleToggleFullscreen} 
                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                        title="Exit Fullscreen"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    onDeployClick={() => setIsDeployModalVisible(true)} 
                    onNewProjectClick={handleNewProject}
                    onIdeaClick={() => setIsIdeaModalVisible(true)}
                    onRoadmapClick={() => setIsRoadmapModalVisible(true)}
                    history={history}
                    onHistorySelect={handleHistorySelect}
                    onClearHistory={handleClearHistory}
                    onLogout={handleLogout}
                />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4">
                        <PromptForm 
                            prompt={prompt} 
                            setPrompt={setPrompt} 
                            onGenerate={handleGenerate} 
                            loadingAction={loadingAction}
                            onImageClick={() => setIsImageModalVisible(true)}
                            onFullStackClick={() => setIsFullStackModalVisible(true)}
                        />
                    </div>
                    {error && <div className="text-red-600 bg-red-100 p-3 rounded-lg border border-red-300 mx-4 mb-4">{error}</div>}
                    
                    {generatedCode ? (
                        <div className="flex-1 flex overflow-hidden px-4 pb-4 gap-4">
                            <div className="flex flex-col gap-4 overflow-hidden" style={{ width: `${leftPaneWidth}%`, minWidth: '200px' }}>
                                <EditorTabs
                                    activeTab={activeEditorTab}
                                    setActiveTab={setActiveEditorTab}
                                    code={generatedCode}
                                    customCss={customCss}
                                    onCodeChange={handleCodeChange}
                                    onCustomCssChange={setCustomCss}
                                    onRegenerate={handleRegenerate}
                                    onUndo={handleUndo}
                                    onRedo={handleRedo}
                                    canUndo={currentCodeHistoryIndex > 0}
                                    canRedo={currentCodeHistoryIndex < codeHistory.length - 1}
                                    isLoading={isLoading}
                                    editorTheme={editorTheme}
                                    setEditorTheme={setEditorTheme}
                                    htmlEditorRef={htmlEditorRef}
                                    cssEditorRef={cssEditorRef}
                                    onSaveProject={handleSaveProject}
                                    onRefactorClick={handleOpenRefactorModal}
                                />
                            </div>
                            <div className="splitter-y" onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }} />
                            <div className="flex-1 flex flex-col gap-2 overflow-hidden relative" style={{ width: `calc(${100 - leftPaneWidth}% - 8px)`, minWidth: '200px' }}>
                                <PreviewToolbar
                                    onApplyTheme={handleThemeChange}
                                    isLoadingTheme={loadingAction === 'theme'}
                                    previewDevice={previewDevice}
                                    setPreviewDevice={handleDeviceChange}
                                    onOpenInNewTab={handleOpenInNewTab}
                                    onToggleFullscreen={handleToggleFullscreen}
                                    isCustomizeMode={isCustomizeMode}
                                    onToggleCustomize={() => setIsCustomizeMode(!isCustomizeMode)}
                                />
                                <div 
                                    className={`flex-1 bg-gray-200 rounded-b-lg border border-gray-300 overflow-auto flex justify-center items-center p-4 ${isDragging ? 'cursor-grabbing' : (previewDevice !== 'desktop' ? 'cursor-grab' : '')}`}
                                    onMouseDown={handleDragMouseDown}
                                    onMouseMove={handleDragMouseMove}
                                    onMouseUp={handleDragMouseUp}
                                    onMouseLeave={handleDragMouseLeave}
                                >
                                    <div 
                                        className="shadow-2xl bg-gray-100 transition-all duration-300 ease-in-out"
                                        style={{
                                            width: previewSize.width,
                                            height: previewSize.height,
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            pointerEvents: isDragging || isCustomizeMode ? 'none' : 'auto',
                                        }}
                                    >
                                        <iframe
                                            ref={iframeRef}
                                            srcDoc={displayCode}
                                            title="Live Preview"
                                            className="bg-white border-none w-full h-full rounded-md"
                                            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                                        />
                                    </div>
                                </div>
                                {selectedElement ? (
                                    <StyleEditorSidebar 
                                        element={selectedElement} 
                                        onClose={() => setSelectedElement(null)}
                                        onStyleChange={handleStyleChange}
                                    />
                                ) : (
                                    <ChatBox messages={chatMessages} onSubmit={handleChatSubmit} isLoading={isLoading} />
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 p-4 pt-0">
                           <WelcomeScreen isLoading={isLoading} />
                        </div>
                    )}
                </main>
            </div>
            <footer className="text-center p-2 text-xs text-gray-500 bg-white border-t border-gray-200 flex-shrink-0">
                &copy; 2025 ZECREV CODEZ. All Rights Reserved. A ZECREV Startup.
            </footer>
        </div>
    );
};

export default App;