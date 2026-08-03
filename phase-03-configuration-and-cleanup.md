# Phase 3: Configuration & Cleanup

This phase improves maintainability and cleans up technical debt.

## Tasks
1.  **Dependency Cleanup**
    *   **Issue:** Dead dependency `node-fetch`.
    *   **Action:** Remove `node-fetch` from `package.json` and uninstall it, since the native `fetch` or Electron's net module is preferred/used.

2.  **Configuration Extraction**
    *   **Issue:** Hardcoded configurations (URL, model, prompt, magic numbers like 1500ms, 5000ms).
    *   **Action:** Extract these values into a dedicated `config.js` or `.env` file. Replace magic numbers in `renderer.js` with named constants.

3.  **Error Handling & Edge Cases**
    *   **Issue:** Generic error when Ollama is down, missing input validation, no timeout handling.
    *   **Action:** Add robust connection timeout handling in `main.js`. Improve error messages sent to the UI. Add basic input validation before sending to the backend.
