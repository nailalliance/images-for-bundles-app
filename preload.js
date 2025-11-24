const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    selectDirectory: () => ipcRenderer.invoke('select-dirs'),
    generate: (data) => ipcRenderer.invoke('run-generation', data)
});