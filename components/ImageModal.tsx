import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateImageFromIdea } from '../services/geminiService';
import type { LoadingAction } from '../types';

interface ImageModalProps {
    onClose: () => void;
    onGenerate: (imageData: { mimeType: string; data: string }, source: string) => void;
    setLoadingAction: (action: LoadingAction) => void;
    currentLoadingAction: LoadingAction;
}

type ImageTab = 'draw' | 'upload' | 'ai';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // remove the prefix e.g. "data:image/png;base64,"
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Failed to convert blob to base64 string."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const ImageModal: React.FC<ImageModalProps> = ({ onClose, onGenerate, setLoadingAction, currentLoadingAction }) => {
    const [activeTab, setActiveTab] = useState<ImageTab>('draw');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedImageType, setUploadedImageType] = useState<string>('image/png');
    const [idea, setIdea] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [error, setError] = useState<string>('');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const isLoading = currentLoadingAction !== null;

    useEffect(() => {
        if (activeTab === 'draw' && canvasRef.current) {
            const canvas = canvasRef.current;
            // Adjust for DPI for sharper drawing
            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvas.offsetWidth * dpr;
            canvas.height = canvas.offsetHeight * dpr;
            
            const context = canvas.getContext('2d');
            if (context) {
                context.scale(dpr, dpr);
                context.lineCap = 'round';
                context.strokeStyle = 'black';
                context.lineWidth = 2;
                contextRef.current = context;
            }
        }
    }, [activeTab]);

    const startDrawing = useCallback(({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current?.beginPath();
        contextRef.current?.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    }, []);

    const finishDrawing = useCallback(() => {
        contextRef.current?.closePath();
        setIsDrawing(false);
    }, []);

    const draw = useCallback(({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current?.lineTo(offsetX, offsetY);
        contextRef.current?.stroke();
    }, [isDrawing]);

    const clearCanvas = () => {
        if (canvasRef.current && contextRef.current) {
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setUploadedImageType(file.type);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateImage = async () => {
        if (!idea.trim()) return;
        setLoadingAction('idea-to-image');
        setError('');
        setGeneratedImage(null);
        try {
            const base64Image = await generateImageFromIdea(idea);
            setGeneratedImage(`data:image/png;base64,${base64Image}`);
        } catch (e) {
            setError('Failed to generate image. Please try again.');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleGenerateWebsite = async () => {
        let imageData: { mimeType: string, data: string } | null = null;
        let source = 'unknown';

        if (activeTab === 'draw' && canvasRef.current) {
            source = 'drawing';
            const canvas = canvasRef.current;
            const dataUrl = canvas.toDataURL('image/png');
            imageData = { mimeType: 'image/png', data: dataUrl.split(',')[1] };
        } else if (activeTab === 'upload' && uploadedImage) {
            source = 'upload';
            imageData = { mimeType: uploadedImageType, data: uploadedImage.split(',')[1] };
        } else if (activeTab === 'ai' && generatedImage) {
            source = 'AI generation';
            imageData = { mimeType: 'image/png', data: generatedImage.split(',')[1] };
        }

        if (imageData) {
            onGenerate(imageData, source);
            onClose();
        } else {
            setError('No image available to generate from.');
        }
    };

    const isGenerateDisabled = 
        isLoading ||
        (activeTab === 'draw' && !canvasRef.current) ||
        (activeTab === 'upload' && !uploadedImage) ||
        (activeTab === 'ai' && !generatedImage);


    const tabButtonBase = "px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200";
    const activeTabClass = "border-blue-600 text-blue-600";
    const inactiveTabClass = "border-transparent text-gray-500 hover:text-gray-800";

    const loadingSpinner = (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full h-5/6 text-gray-800 border border-gray-200 relative transform transition-all flex flex-col" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex-shrink-0">
                    <h2 className="text-2xl font-bold text-blue-600 mb-2 text-center">Generate Website from Image</h2>
                    <div className="border-b border-gray-200 mb-4">
                        <nav className="-mb-px flex justify-center gap-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('draw')} className={`${tabButtonBase} ${activeTab === 'draw' ? activeTabClass : inactiveTabClass}`}>Draw</button>
                            <button onClick={() => setActiveTab('upload')} className={`${tabButtonBase} ${activeTab === 'upload' ? activeTabClass : inactiveTabClass}`}>Upload</button>
                            <button onClick={() => setActiveTab('ai')} className={`${tabButtonBase} ${activeTab === 'ai' ? activeTabClass : inactiveTabClass}`}>AI Generate</button>
                        </nav>
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-auto">
                    {activeTab === 'draw' && (
                        <div className="flex-1 flex flex-col gap-2">
                             <p className="text-sm text-gray-500 text-center">Draw a simple wireframe of your website layout.</p>
                             <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseUp={finishDrawing}
                                    onMouseOut={finishDrawing}
                                    onMouseMove={draw}
                                    className="w-full h-full bg-gray-50"
                                />
                             </div>
                            <button onClick={clearCanvas} className="text-sm text-blue-600 hover:underline">Clear Canvas</button>
                        </div>
                    )}
                    {activeTab === 'upload' && (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            {uploadedImage ? (
                                <>
                                    <img src={uploadedImage} alt="Upload preview" className="max-h-80 object-contain border border-gray-200 rounded-lg"/>
                                    <button onClick={() => setUploadedImage(null)} className="text-sm text-blue-600 hover:underline">Choose a different image</button>
                                </>
                            ) : (
                                <>
                                    <label htmlFor="image-upload" className="w-full cursor-pointer p-10 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-blue-500 hover:text-blue-600 transition">
                                        Click to upload an image
                                    </label>
                                    <input id="image-upload" type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageUpload} />
                                    <p className="text-xs text-gray-400">Supported formats: PNG, JPG, WebP</p>
                                </>
                            )}
                        </div>
                    )}
                    {activeTab === 'ai' && (
                        <div className="flex-1 flex flex-col gap-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={idea}
                                    onChange={(e) => setIdea(e.target.value)}
                                    placeholder="e.g., A sleek landing page for a new SaaS product"
                                    className="flex-1 p-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                    disabled={currentLoadingAction === 'idea-to-image'}
                                />
                                <button onClick={handleGenerateImage} disabled={!idea.trim() || currentLoadingAction === 'idea-to-image'} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center justify-center">
                                    {currentLoadingAction === 'idea-to-image' ? (
                                        <><svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...</>
                                    ) : "Generate Image"}
                                </button>
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div className="flex-1 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-lg p-4">
                                {currentLoadingAction === 'idea-to-image' ? (
                                     <p className="text-gray-500">Generating image...</p>
                                ) : generatedImage ? (
                                    <img src={generatedImage} alt="AI generated preview" className="max-h-full object-contain"/>
                                ) : (
                                    <p className="text-gray-500">Your generated image will appear here.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex-shrink-0">
                    <button onClick={handleGenerateWebsite} disabled={isGenerateDisabled} className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 transition flex items-center justify-center">
                        {currentLoadingAction === 'image-to-code' ? (
                            <>{loadingSpinner} Generating Website...</>
                        ) : 'Generate Website from Image'}
                    </button>
                </div>
            </div>
        </div>
    );
};