const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
// node-fetch removed to use native Web fetch API which supports getReader()
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    skipTaskbar: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
  
  // Make the window click-through by default so the user can interact with apps behind it.
  // The renderer process will send IPC messages to re-enable clicks when hovering over interactive elements.
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.setIgnoreMouseEvents(ignore, options);
    }
  });

  ipcMain.on('move-window-by', (event, dx, dy) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      const [x, y] = win.getPosition();
      win.setPosition(x + dx, y + dy);
    }
  });
}

let tray = null;
app.whenReady().then(() => {
  createWindow();
  
  tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Thoát', click: () => app.quit() }
  ]);
  tray.setToolTip('Remielle');
  tray.setContextMenu(contextMenu);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Simple IPC for LLM call placeholder
ipcMain.on('chat', async (event, prompt) => {
  try {
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b', 
        system: "You are Remielle, a cute, playful, and cheerful virtual desktop assistant. Your personality is sweet and slightly teasing. IMPORTANT RULES:\n1. You MUST ONLY reply in Vietnamese or English. Refuse to speak any other languages.\n2. ALWAYS stay in character. Never break the fourth wall or admit you are an AI.\n3. Keep your answers brief and concise (1-3 sentences) so the user can read them quickly.\n4. Occasionally use kaomoji like UwU, :3, or ~ to show your cute personality.",
        prompt: `User: ${prompt}\nRemielle:`,
        stream: true
      })
    });
    
    if (!response.ok) {
        throw new Error("HTTP error " + response.status);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const decoded = decoder.decode(value, { stream: true });
      const lines = decoded.split('\n').filter(l => l.trim().length > 0);
      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (data.response) {
            event.sender.send('chat-chunk', { success: true, text: data.response });
          }
        } catch(e) {} // skip invalid JSON lines
      }
    }
    event.sender.send('chat-complete', { success: true });
  } catch (err) {
    console.error('LLM Fetch error:', err);
    event.sender.send('chat-error', { success: false, error: "Xin lỗi, tôi không kết nối được với não bộ của mình (Ollama) ạ T.T" });
  }
});
