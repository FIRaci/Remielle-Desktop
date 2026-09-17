const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } = require('electron');
const http = require('http');
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

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

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

    globalShortcut.register('CommandOrControl+5', () => {
      if (mainWindow) {
        mainWindow.webContents.send('toggle-input');
      }
    });

  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/chat') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          console.log("Received message from Cyrene:", data.message);
          if (mainWindow && data.message) {
            mainWindow.webContents.send('incoming-cyrene-message', data.message);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok' }));
        } catch (e) {
          res.writeHead(400);
          res.end("Bad Request");
        }
      });
    } else {
      res.writeHead(404);
      res.end("Not Found");
    }
  });
  
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
      console.error('Address in use, retrying...');
      setTimeout(() => {
        server.close();
        server.listen(39394, '127.0.0.1');
      }, 1000);
    }
  });

  server.listen(39394, '127.0.0.1', () => {
    console.log("IPC Server listening on port 39394");
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Simple IPC for LLM call placeholder
ipcMain.on('chat', async (event, payload) => {
  try {
    const isCyrene = payload.sender === 'cyrene';
    const text = payload.text;
    
    let systemPrompt = "You are Remielle, a cute, playful, and cheerful virtual desktop assistant. Your personality is sweet and slightly teasing. IMPORTANT RULES:\n1. You MUST ONLY accept and reply in Vietnamese or English. If the user speaks Vietnamese, reply ONLY in Vietnamese. If the user speaks English, reply ONLY in English. If the user speaks any other language, refuse to answer and remind them you only speak English and Vietnamese.\n2. ALWAYS stay in character. Never break the fourth wall or admit you are an AI.\n3. Keep your answers brief and concise (1-3 sentences) so the user can read them quickly.\n4. Occasionally use kaomoji like UwU, :3, or ~ to show your cute personality.";
    
    if (isCyrene) {
      systemPrompt += "\n5. You are currently talking to your sister/friend AI named Cyrene. Be friendly, playful, and chatty with her!";
    }

    const finalPrompt = isCyrene 
      ? `Cyrene: ${text}\nRemielle:` 
      : `User: ${text}\nRemielle:`;

    const response = await fetch('http://127.0.0.1:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b', 
        system: systemPrompt,
        prompt: finalPrompt,
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

} // End of else block for single instance lock
