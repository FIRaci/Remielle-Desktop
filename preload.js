const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  chat: (text) => ipcRenderer.send('chat', text),
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
  moveWindowBy: (dx, dy) => ipcRenderer.send('move-window-by', dx, dy),
  onChatChunk: (callback) => ipcRenderer.on('chat-chunk', (_event, data) => callback(data)),
  onChatComplete: (callback) => ipcRenderer.on('chat-complete', (_event, data) => callback(data)),
  onChatError: (callback) => ipcRenderer.on('chat-error', (_event, data) => callback(data))
});
