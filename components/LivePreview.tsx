import React from 'react';
import type { Device } from '../types';

interface LivePreviewProps {
    device: Device;
    setDevice: (device: Device) => void;
}

const DeviceButton: React.FC<{
    currentDevice: Device;
    targetDevice: Device;
    setDevice: (device: Device) => void;
    children: React.ReactNode;
}> = ({ currentDevice, targetDevice, setDevice, children }) => {
    const isActive = currentDevice === targetDevice;
    return (
        <button
            onClick={() => setDevice(targetDevice)}
            className={`p-2 rounded-md transition-all duration-150 ease-in-out hover:scale-110 active:scale-100 ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-600 text-gray-300'
            }`}
        >
            {children}
        </button>
    );
};


export const LivePreview: React.FC<LivePreviewProps> = ({ device, setDevice }) => {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-gray-700 p-1 rounded-lg">
                 <DeviceButton currentDevice={device} targetDevice="desktop" setDevice={setDevice}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </DeviceButton>
                <DeviceButton currentDevice={device} targetDevice="tablet" setDevice={setDevice}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </DeviceButton>
                <DeviceButton currentDevice={device} targetDevice="mobile" setDevice={setDevice}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2zM10 5.5h4" /></svg>
                </DeviceButton>
            </div>
        </div>
    );
};