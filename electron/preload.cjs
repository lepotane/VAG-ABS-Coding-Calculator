/** Guvenli preload: arayuzun pencere ve veri seti islemleri icin. */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mk100", {
  isDesktop: true,

  // pencere kontrolu
  minimize: () => ipcRenderer.invoke("win:minimize"),
  maximize: () => ipcRenderer.invoke("win:maximize"),
  close: () => ipcRenderer.invoke("win:close"),
  isMaximized: () => ipcRenderer.invoke("win:isMaximized"),
  onWindowState: (cb) => ipcRenderer.on("win:state", (_e, s) => cb(s)),

  // veri seti
  datasetPath: () => ipcRenderer.invoke("data:path"),
  readDataset: () => ipcRenderer.invoke("data:read"),
  onReload: (cb) => ipcRenderer.on("data:reload", () => cb()),
  setLang: (lang) => ipcRenderer.send("ui:lang", lang),
});
