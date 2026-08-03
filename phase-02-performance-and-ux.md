# Phase 2: Performance & UX

This phase focuses on improving the responsiveness and visual consistency of the application.

## Tasks
1.  **Streaming LLM Responses**
    *   **Issue:** Synchronous-like UX blocks UI as `stream: false` is used for Ollama.
    *   **Action:** Update the backend fetch to Ollama to handle streaming responses. Stream chunks to the frontend via the secure IPC channel to provide real-time feedback.

2.  **Asset Preloading & Layout Stability**
    *   **Issue:** GIF asset flickering on load and layout shifts from the hidden bubble. Transition jitter.
    *   **Action:** Preload necessary GIFs in `renderer.js` or `index.html`. Optimize CSS to reserve space for hidden elements to prevent layout shifts.

3.  **Structured IPC Contracts**
    *   **Issue:** Brittle IPC using raw strings.
    *   **Action:** Define a structured JSON format (e.g., `{ type, payload, error }`) for all IPC communication between `main.js` and `renderer.js`.
