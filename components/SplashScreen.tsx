import React from 'react';

interface SplashScreenProps {
    isFadingOut: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut }) => {
    return (
        <div 
            className={`fixed inset-0 bg-gray-900 flex items-center justify-center z-50 text-white splash-screen ${isFadingOut ? 'fade-out' : ''}`}
        >
            <h1 className="text-4xl md:text-6xl font-bold tracking-wider splash-text">
                <span className="text-blue-400">WELCOME TO </span>
                <span className="text-white">ZECREV</span>
            </h1>
        </div>
    );
};
