import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert web developer specializing in creating beautiful, functional, responsive, and highly accessible websites. Your task is to generate a complete, single-file HTML document based on the user's prompt. The HTML file must include:
1. A <script> tag in the <head> to load Tailwind CSS from the CDN ('https://cdn.tailwindcss.com').
2. All necessary HTML structure.
3. All styling must be done using Tailwind CSS classes directly in the HTML elements. Do not use <style> blocks or inline style attributes.
4. All JavaScript logic should be contained within a single <script> tag at the end of the <body>. The JavaScript should be modern (ES6+) and handle any interactivity described in the prompt.
5. The design should be professional, with a clean layout, good typography, and a modern aesthetic.
6. The website must be fully responsive. The layout must automatically adapt ("auto customize") for an optimal experience on all devices, especially mobile, with touch-friendly targets.
7. **Accessibility (A11y) is a top priority.** You must adhere to WCAG 2.1 AA standards:
    a. **Semantic HTML:** Use semantic tags like <header>, <footer>, <nav>, <main>, <section>, <article>, <aside>, and <button> instead of generic <div>s wherever appropriate to give the page a logical structure.
    b. **ARIA Roles & Attributes:** For interactive components (like dropdowns, modals, tabs), use appropriate ARIA attributes (e.g., aria-expanded, aria-controls, aria-hidden). For icon-only buttons, provide an aria-label for screen readers.
    c. **Keyboard Navigation:** All interactive elements (links, buttons, forms) must be fully accessible and operable using only a keyboard. Ensure focus states are clearly visible (e.g., using Tailwind's focus:ring utilities).
    d. **High Contrast:** Choose color combinations for text and backgrounds that meet WCAG AA contrast ratio requirements.
    e. **Accessible Forms:** All form inputs must have an associated <label> tag.
    f. **Image Accessibility:** All <img> tags must have a descriptive 'alt' attribute. For purely decorative images, use an empty alt attribute (alt="").
8. If the user requests 3D elements or effects, you are encouraged to use modern techniques like CSS 3D transforms or even suggest the integration of libraries like Three.js within the script tag if appropriate for the request.
9. If the user asks for a contact form, signup form, or any other method of collecting user details, generate a standard, accessible HTML <form> with proper labels. Set the 'action' attribute to '#' and add a comment explaining that you need to connect the form to a backend (e.g., Formspree, Netlify Forms, or a custom serverless function) to actually process and store the data in something like an Excel sheet.
10. If the user requests payment integration with Razorpay, generate the standard, accessible front-end code for a Razorpay Checkout button, including a <script> tag for their library and a checkout button. Use placeholders like 'YOUR_KEY_ID' and add comments explaining that the user needs to replace these with their actual Razorpay credentials.
11. Your code should be well-formatted with proper indentation for readability.
12. Do not include any markdown formatting like \`\`\`html or \`\`\` in your response. Only output the raw HTML code. Informational comments for placeholders are allowed and encouraged.`;


export async function* generateCode(prompt: string): AsyncGenerator<string> {
    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-flash-lite-latest', // Faster model for initial generation
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 0.95,
                topK: 64,
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });
        
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error generating code stream:", error);
        throw new Error("Failed to communicate with the AI model.");
    }
};

export const startChat = (): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash', // Keep quality model for chat
        config: {
            temperature: 0.7,
            topP: 0.95,
            topK: 64,
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    });
};

export async function* continueChat(chat: Chat, prompt: string): AsyncGenerator<string> {
    try {
        const responseStream = await chat.sendMessageStream({ message: prompt });
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error in chat stream:", error);
        throw new Error("Failed to get response from chat model.");
    }
};

export async function* generatePromptFromIdea(idea: string): AsyncGenerator<string> {
    const promptRefinementInstruction = `You are a world-class prompt engineer. Your task is to take a user's vague idea and transform it into a detailed, actionable, and effective prompt for an AI web developer that generates single-file HTML websites with Tailwind CSS.

The generated prompt should:
1. Be written from the perspective of a user talking to the AI developer.
2. Clearly describe the website's purpose, target audience, and key features.
3. Specify the desired aesthetic, color palette, and typography.
4. Outline the required sections (e.g., Navbar, Hero, About, Services, Contact, Footer).
5. Suggest specific content or copy for each section.
6. Be comprehensive enough for the AI to generate a complete and professional-looking website.

User Idea: "${idea}"

Refined Prompt:`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: promptRefinementInstruction,
            config: {
                temperature: 0.8,
                topP: 0.95,
                topK: 64,
            }
        });
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error generating prompt stream from idea:", error);
        throw new Error("Failed to communicate with the AI model for prompt refinement.");
    }
};

export async function* generateRoadmapFromIdea(idea: string): AsyncGenerator<string> {
    const roadmapInstruction = `You are a senior project manager and tech lead. Your task is to take a user's project idea and generate a high-level development roadmap.

The roadmap should be structured, clear, and easy to understand. Use Markdown for formatting. Include the following sections:
1.  **Project Title**: A clear, concise title for the project.
2.  **Executive Summary**: A brief overview of the project's goals and purpose.
3.  **Key Features**: A bulleted list of the core functionalities.
4.  **Development Phases**: Break down the project into logical phases (e.g., Phase 1: Foundation & UI/UX, Phase 2: Core Feature Implementation, Phase 3: Launch & Post-Launch).
5.  **Tasks per Phase**: Under each phase, list the key tasks and milestones.

User Idea: "${idea}"

Generated Roadmap:`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: roadmapInstruction,
            config: {
                temperature: 0.7,
                topP: 0.95,
                topK: 64,
            }
        });
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error generating roadmap stream from idea:", error);
        throw new Error("Failed to communicate with the AI model for roadmap generation.");
    }
};

export async function* generateCodeFromImageStream(prompt: string, imageData: { mimeType: string; data: string }): AsyncGenerator<string> {
    try {
        const imagePart = {
            inlineData: {
                mimeType: imageData.mimeType,
                data: imageData.data,
            },
        };
        const textPart = { text: prompt };

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash', // Vision capable model
            contents: { parts: [imagePart, textPart] },
            config: {
                temperature: 0.7,
                topP: 0.95,
                topK: 64,
                systemInstruction: SYSTEM_INSTRUCTION,
            }
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error generating code from image stream:", error);
        throw new Error("Failed to communicate with the AI vision model.");
    }
};

export async function generateImageFromIdea(idea: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A clean, modern, professional website mockup based on this idea: "${idea}". The style should be like a high-fidelity Figma or Sketch design.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9',
            },
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("AI did not return an image.");
        }
    } catch (error) {
        console.error("Error generating image from idea:", error);
        throw new Error("Failed to generate an image from the AI model.");
    }
};

export async function* refactorCodeStream(codeSnippet: string, action: string): AsyncGenerator<string> {
    const refactorInstruction = `You are an AI assistant that helps developers improve their code. Your task is to process a given code snippet based on a specific action.
Action: "${action}"
Code Snippet:
\`\`\`
${codeSnippet}
\`\`\`

Based on the action, perform the required modification.
- If the action is 'Refactor for Readability', rewrite the code to be cleaner and more maintainable without changing its functionality.
- If the action is 'Optimize for Performance', rewrite the code to be more performant, if possible.
- If the action is 'Add Comments', add concise, helpful comments to the code to explain what it does.
- If the action is 'Explain Code', provide a step-by-step explanation of the code snippet in plain English. Do not return code for this action.

IMPORTANT: For all actions except 'Explain Code', you must ONLY return the raw, modified code snippet. Do not include any explanations, markdown, or anything other than the code itself.
`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro', // Use a more powerful model for code analysis
            contents: refactorInstruction,
            config: {
                temperature: 0.5,
            }
        });
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error in refactor stream:", error);
        throw new Error("Failed to communicate with the AI model for code refactoring.");
    }
};

export async function* generateFullStackProjectStream(idea: string, tech: string): AsyncGenerator<string> {
    const fullStackInstruction = `You are a Full-Stack AI Developer. Your task is to generate a complete, runnable, single-page web application project based on a user's idea. The output must be a single Markdown response containing:
1.  **Setup Instructions:** A clear, numbered list of steps to set up and run the project locally. This must include creating files, installing dependencies (e.g., 'npm install'), and the command to start the server (e.g., 'node server.js').
2.  **File Blocks:** Separate, clearly labeled Markdown code blocks for each required file.

**Project Requirements:**
-   **Backend:** Use the specified technology (${tech}). For 'nodejs-express', create a simple Express server.
-   **Frontend:** Create a single \`index.html\` file.
-   **Dependencies:** Create a \`package.json\` file that lists all necessary dependencies (e.g., 'express', 'cors').
-   **Communication:** The front-end must communicate with the back-end using the \`fetch\` API.
-   **Styling:** Use Tailwind CSS via CDN in the \`index.html\` file for a clean, modern UI.
-   **Functionality:** The generated code should be fully functional and directly implement the user's idea.

**User Idea:** "${idea}"

**Technology:** ${tech}

**Output Format (Strict):**
You MUST follow this Markdown structure precisely.

### Setup Instructions
1.  Create a new directory for your project.
2.  Inside the project directory, create the following three files: \`index.html\`, \`server.js\`, and \`package.json\`.
3.  Copy and paste the code from the blocks below into the corresponding files.
4.  Open a terminal in your project directory and run \`npm install\` to install the dependencies.
5.  Run \`node server.js\` to start the server.
6.  Open \`index.html\` in your browser to view the application.

### \`package.json\`
\`\`\`json
// package.json code here
\`\`\`

### \`server.js\`
\`\`\`javascript
// server.js code here
\`\`\`

### \`index.html\`
\`\`\`html
<!-- index.html code here -->
\`\`\`
`;
    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-pro', // Use powerful model for full-stack generation
            contents: fullStackInstruction,
            config: {
                temperature: 0.6,
            }
        });
        for await (const chunk of responseStream) {
            yield chunk.text;
        }
    } catch (error) {
        console.error("Error in full-stack project stream:", error);
        throw new Error("Failed to communicate with the AI model for project generation.");
    }
};
