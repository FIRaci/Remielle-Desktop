# Phase 1: Security & Stability

This phase addresses critical vulnerabilities and application-breaking bugs.

## Tasks
1.  **Secure IPC & Disable Node Integration (Critical)**
    *   **Issue:** `main.js` currently uses `nodeIntegration: true` and `contextIsolation: false`, exposing the application to RCE via XSS.
    *   **Action:** Set `nodeIntegration: false` and `contextIsolation: true`. Implement a `preload.js` script using `contextBridge` to expose specific, secure IPC methods to the renderer.

2.  **Input Locking & Concurrency Prevention (Critical)**
    *   **Issue:** Spamming input triggers concurrent LLM inferences, crashing the system.
    *   **Action:** Disable the input field and submit button during IPC calls. Add a lock state in `renderer.js` to prevent overlapping `sendMessage` calls.

3.  **Timer Race Condition Resolution (Critical)**
    *   **Issue:** State collision due to pending timers in `renderer.js` not being cleared during new user interactions.
    *   **Action:** Store timer references and explicitly `clearTimeout()` when transitioning states or initiating a new interaction.
