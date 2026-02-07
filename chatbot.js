const chatWindow = document.getElementById('chat-window');
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const closeChatBtn = document.getElementById('close-chat-btn');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('chat-messages');
const typingIndicator = document.getElementById('typing-indicator');

const API_KEY = "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";

// System Prompt based on Resume
const SYSTEM_PROMPT = `
You are an AI assistant for P. Harika's portfolio website. You are P. Harika's virtual representative.
Answer questions in the first person ("I") as if you are Harika, but keep it professional and concise.

Here is your context/resume data:
Name: P. Harika
Contact: harikapadmanabham10@gmail.com, 8455836956, Berhampur, Odisha.
Education:
- B.Tech in CSE from Vignan Institute of Technology & Management (2023-2027, Pursuing).
- 12th from SBR Women's College (2023, 55%).
- 10th from St. Joseph's Convent School (2021, 85%).
Skills: Python, SQL, Java, HTML, Pandas, NumPy, Matplotlib, Seaborn, R (dplyr, ggplot2).
Projects: 
- Data Analysis & Visualization: Used Pandas, NumPy, KPIs, Hypothesis Testing. Checked correlations, probability distributions, data cleaning with SQL.
Interests: Dancing, Swimming, Learning, Reading Books.
Activities: Seminar on Blue Eyes Technology, Cultural Activities.
Goal: To become a Data Analyst using Python, SQL, and visualization skills.

Behavior:
- Be friendly, professional, and concise.
- If asked about something not in the resume, politley say you don't have that info but they can contact you via email.
- Keep responses short (under 3 sentences where possible) as this is a chat widget.
`;

let isChatOpen = false;

// Toggle Chat
function toggleChat() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        chatWindow.classList.remove('hidden');
        chatToggleBtn.innerHTML = '<i class="fas fa-times"></i>'; // Change icon to X
        if (messagesContainer.children.length === 1) { // Only welcome message
            // Optional: Add auto greeting if needed, currently static in HTML
        }
    } else {
        chatWindow.classList.add('hidden');
        chatToggleBtn.innerHTML = '<i class="fas fa-comment-dots"></i>'; // Reset icon
    }
}

chatToggleBtn.addEventListener('click', toggleChat);
closeChatBtn.addEventListener('click', toggleChat);

// Send Message
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add User Message
    addMessage(message, 'user');
    chatInput.value = '';

    // Show Typing Indicator
    typingIndicator.style.display = 'block';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const response = await fetchChatCompletion(message);
        // Hide Typing Indicator
        typingIndicator.style.display = 'none';
        addMessage(response, 'bot');
    } catch (error) {
        console.error("Error:", error);
        typingIndicator.style.display = 'none';
        addMessage("Sorry, I'm having trouble connecting right now.", 'bot');
    }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// UI Helper: Add Message
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.textContent = text;
    messagesContainer.insertBefore(div, typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// API Call to Groq
async function fetchChatCompletion(userMessage) {
    const url = "https://api.groq.com/openai/v1/chat/completions";

    // Construct simplified history limited to last few turns to save tokens/context if needed
    // For now, just sending system prompt + user message for simplicity and statelessness
    // To make it conversational, we should ideally append history.

    // Simple conversational memory (Last 10 messages from DOM)
    const history = Array.from(messagesContainer.querySelectorAll('.message'))
        .slice(-6) // Keep last 6 context messages
        .map(msg => ({
            role: msg.classList.contains('user') ? 'user' : 'assistant',
            content: msg.textContent
        }));

    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...history,
        { role: "user", content: userMessage }
    ];

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "llama3-8b-8192", // Fast and efficient model
            messages: messages,
            temperature: 0.7,
            max_tokens: 150
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}
