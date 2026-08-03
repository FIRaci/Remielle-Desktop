const ASSETS = {
  WAITING: 'assets/waiting_user_input.gif',
  USER_TYPING: 'assets/user_typing.gif',
  AI_THINKING: 'assets/ai_thingking.gif',
  AI_TYPING: 'assets/ai_typing.gif',
  AI_COMPLETE: 'assets/ai_complete_answer.gif'
};

const STATES = {
  WAITING: 'WAITING',
  USER_TYPING: 'USER_TYPING',
  AI_THINKING: 'AI_THINKING',
  AI_TYPING: 'AI_TYPING',
  AI_COMPLETE: 'AI_COMPLETE'
};

// Preload images to prevent flickering
const preloadedImages = {};
for (const key in ASSETS) {
  const img = new Image();
  img.src = ASSETS[key];
  preloadedImages[key] = img;
}

let currentState = STATES.WAITING;

let typingTimer = null;
let resetTimer = null;
let isProcessing = false;

const avatarContainer = document.getElementById('avatar-container');
const avatarImg = document.getElementById('avatar-img');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatBubble = document.getElementById('chat-bubble');
const chatContent = document.getElementById('chat-content');

// Handle click-through dynamic toggling
const interactiveElements = [
  document.getElementById('input-container'), 
  chatBubble, 
  avatarContainer
];

interactiveElements.forEach(el => {
  el.addEventListener('mouseenter', () => {
    window.electronAPI.setIgnoreMouseEvents(false);
  });
  el.addEventListener('mouseleave', () => {
    window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
  });
});

let isDragging = false;

avatarContainer.addEventListener('mousedown', (e) => {
  if (e.ctrlKey && e.button === 0) { // Only on left click + Ctrl
    isDragging = true;
    e.preventDefault();
  }
});

window.addEventListener('mousemove', (e) => {
  if (isDragging) {
    window.electronAPI.moveWindowBy(e.movementX, e.movementY);
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
});

// UI Toggles
let isInputVisible = true;

window.addEventListener('mousedown', (e) => {
  // Ctrl + Mouse 4 or 5
  if (e.ctrlKey && (e.button === 3 || e.button === 4)) {
    isInputVisible = !isInputVisible;
    inputContainer.style.opacity = isInputVisible ? '1' : '0';
    inputContainer.style.pointerEvents = isInputVisible ? 'auto' : 'none';
  }
});

// Ctrl+5 shortcut removed per user request

function clearTimers() {
  if (typingTimer) clearTimeout(typingTimer);
  if (resetTimer) clearTimeout(resetTimer);
  typingTimer = null;
  resetTimer = null;
}

function setState(newState) {
  if (currentState === newState) return;
  currentState = newState;
  avatarImg.src = ASSETS[newState];
}

function showBubble(text) {
  chatContent.innerText = text;
  chatBubble.classList.remove('hidden');
}

function hideBubble() {
  chatBubble.classList.add('hidden');
}

userInput.addEventListener('input', () => {
  if (isProcessing) return;
  clearTimers();
  if (userInput.value.trim().length > 0) {
    setState(STATES.USER_TYPING);
  } else {
    setState(STATES.WAITING);
    hideBubble();
  }
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);

let currentMessage = "";

async function sendMessage() {
  if (isProcessing) return;
  const text = userInput.value.trim();
  if (!text) return;

  isProcessing = true;
  userInput.disabled = true;
  sendBtn.disabled = true;
  
  clearTimers();
  currentMessage = "";
  hideBubble();
  userInput.value = '';
  setState(STATES.AI_THINKING);

  window.electronAPI.chat(text);
}

// Handle streaming responses
window.electronAPI.onChatChunk((data) => {
  if (data.success) {
    if (currentState !== STATES.AI_TYPING) {
      setState(STATES.AI_TYPING);
      showBubble("");
    }
    currentMessage += data.text;
    chatContent.innerText = currentMessage;
  }
});

window.electronAPI.onChatComplete((data) => {
  if (data.success) {
    setState(STATES.AI_COMPLETE);
    isProcessing = false;
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
    
    // Return to waiting after a few seconds
    resetTimer = setTimeout(() => {
        setState(STATES.WAITING);
        hideBubble();
    }, 5000);
  }
});

window.electronAPI.onChatError((data) => {
  if (!data.success) {
    showBubble(data.error || "Oops, có lỗi xảy ra!");
    setState(STATES.WAITING);
    isProcessing = false;
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
});
