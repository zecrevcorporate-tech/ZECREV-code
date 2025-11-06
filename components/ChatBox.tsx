import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatBoxProps {
    messages: ChatMessage[];
    onSubmit: (message: string) => void;
    isLoading: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSubmit, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSubmit(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg h-64 shadow-sm">
            <div className="flex-1 p-4 overflow-y-auto text-sm space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                           {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
                     <div className="flex justify-start">
                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
                           <span className="animate-pulse">...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex p-2 border-t border-gray-200">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for changes..."
                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    disabled={isLoading || messages.length === 0}
                />
                <button type="submit" className="ml-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all duration-200 ease-in-out enabled:hover:scale-105 enabled:active:scale-95" disabled={isLoading || !input.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};