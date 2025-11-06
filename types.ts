import { Chat } from '@google/genai';

export interface HistoryItem {
    id: number;
    prompt: string;
    code: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export type Device = 'desktop' | 'tablet' | 'mobile';

export type LoadingAction = 'generate' | 'clone' | 'chat' | 'theme' | 'image-to-code' | 'idea-to-image' | 'style' | 'refactor' | 'full-stack' | null;

export type EditorTab = 'html' | 'css';

export type EditorTheme = 'dark' | 'dracula' | 'solarized' | 'light';

export interface SelectedElement {
    id: string;
    tagName: string;
    textContent: string;
    styles: {
        backgroundColor: string;
        color: string;
        padding: string;
        margin: string;
    }
}

export type BackendTech = 'nodejs-express';
