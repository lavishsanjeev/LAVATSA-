// Lavatsa App Logic

document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const chatApp = document.getElementById('chat-app');
    const startChatBtn = document.getElementById('start-chat-btn');

    // Step 1 & 2 Transition Logic
    startChatBtn.addEventListener('click', () => {
        // Fade out landing page
        landingPage.style.opacity = '0';
        landingPage.style.transition = 'opacity 0.3s ease';

        setTimeout(() => {
            landingPage.classList.add('hidden');
            chatApp.classList.remove('hidden');
            // Focus input
            document.getElementById('user-input').focus();
        }, 300);
    });

    // Chat Logic
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // Function to append a message bubble
    function appendMessage(text, sender) {
        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble');
        bubble.classList.add(sender === 'user' ? 'user-bubble' : 'ai-bubble');
        bubble.textContent = text;

        chatWindow.appendChild(bubble);
        scrollToBottom();
    }

    // Function to show loading indicator
    function showLoading() {
        const loader = document.createElement('div');
        loader.id = 'loading-indicator';
        loader.classList.add('chat-bubble', 'ai-bubble');
        loader.innerHTML = '<span class="dot-typing"></span><span class="dot-typing"></span><span class="dot-typing"></span>';
        chatWindow.appendChild(loader);
        scrollToBottom();
        return loader;
    }

    // Function to remove loading indicator
    function removeLoading() {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.remove();
        }
    }

    // Auto-scroll to bottom
    function scrollToBottom() {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Gemini API Configuration
    const API_KEY = 'AIzaSyC_Mty-3Er8hQBC-4Ey0Keoze0AgqBRoAg';
    // Using gemini-2.0-flash as confirmed available by user
    const currentModel = 'gemini-2.0-flash';
    const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

    async function getGeminiResponse(userMessage) {
        const apiUrl = `${BASE_URL}/models/${currentModel}:generateContent?key=${API_KEY}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userMessage }] }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response structure from AI');
            }

        } catch (error) {
            console.error('Error fetching from Gemini:', error);
            return `Connection Error: ${error.message}`;
        }
    }

    // Handle sending message
    async function handleSendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // 1. Add User Message
        appendMessage(text, 'user');
        userInput.value = '';
        userInput.style.height = 'auto';

        // 2. Show Loading
        showLoading();

        // 3. Call Gemini API
        const aiResponse = await getGeminiResponse(text);

        // 4. Remove Loading & Show Response
        removeLoading();
        appendMessage(aiResponse, 'ai');
    }

    // Event Listeners
    sendBtn.addEventListener('click', handleSendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
});
