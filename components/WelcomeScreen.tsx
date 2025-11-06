import React from 'react';

interface WelcomeScreenProps {
    isLoading: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ isLoading }) => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            {isLoading ? (
                <>
                    <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Generating your vision...</p>
                    <p className="text-gray-500">The AI is crafting your code. Please wait a moment.</p>
                </>
            ) : (
                <>
                    <div className="text-blue-600 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v1.051l.243.243a1 1 0 01.212 1.16l-.08.132-1.35 2.25a1 1 0 01-1.632.062L8 8.051V5a1 1 0 011-1zm5.293 2.293a1 1 0 011.414 0l.943.943a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-.943-.943a1 1 0 010-1.414l8-8zM14 10a1 1 0 011 1v1.051l.243.243a1 1 0 01.212 1.16l-.08.132-1.35 2.25a1 1 0 01-1.632.062L12 15.051V12a1 1 0 011-1zM4.707 9.293a1 1 0 011.414 0l.943.943a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-.943-.943a1 1 0 010-1.414l8-8zM6 4a1 1 0 011 1v1.051l.243.243a1 1 0 01.212 1.16l-.08.132-1.35 2.25a1 1 0 01-1.632.062L4 8.051V5a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Unlock Your Creativity with AI</h2>
                    <p className="mt-2 text-gray-600 max-w-md">Start by describing your idea, uploading an image, or even cloning an existing site.</p>
                    <p className="mt-1 text-gray-500">Watch your vision come to life in seconds.</p>
                </>
            )}
        </div>
    );
};