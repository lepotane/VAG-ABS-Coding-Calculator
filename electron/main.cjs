/**
 * Electron ana surec - gercek masaustu program gorunumu.
 *
 * - Ozel baslik cubugu (HTML uzerinde cizilir, tarayici gibi gorunmez)
 * - Dil duyarli menu (TR/EN), gelistirici araclari gizli
 * - Dosya > Veri SetiniAcla gercekten dosyayi acar
 * - Tum pencerelerde menubar ve web gorunumu gizlenir
 */
const { app, BrowserWindow, Menu, dialog, shell, ipcMain, nativeTheme } = require("electron");
const path = require("node:path");
const fs = require("node:fs");

const isDev = !app.isPackaged;
const isMac = process.platform === "darwin";
let win = null;
let uiLang = "tr";

app.disableHardwareAcceleration();

/* --------------------------------------------------------- veri seti yolu */
function datasetPaths() {
  const cands = [];
  if (isDev) {
    cands.push(path.join(__dirname, "..", "src", "data", "mk100_dataset.json"));
    cands.push(path.join(process.cwd(), "src", "data", "mk100_dataset.json"));
  } else {
    cands.push(path.join(process.resourcesPath, "src", "data", "mk100_dataset.json"));
    cands.push(path.join(__dirname, "..", "src", "data", "mk100_dataset.json"));
    cands.push(path.join(process.resourcesPath, "app.asar", "src", "data", "mk100_dataset.json"));
    cands.push(path.join(path.dirname(process.execPath), "src", "data", "mk100_dataset.json"));
  }
  for (const p of cands) if (fs.existsSync(p)) return p;
  return null;
}

function findExternalDataset() {
  // exe yaninda / yanindaki klasorde veri seti ara
  const bases = [
    path.dirname(process.execPath),
    isDev ? path.join(__dirname, "..", "..") : path.dirname(process.execPath),
  ];
  const rels = [
    ["mk100_dataset.json"],
    ["data", "mk100_dataset.json"],
    ["src", "data", "mk100_dataset.json"],
  ];
  for (const b of bases)
    for (const r of rels) {
      const p = path.join(b, ...r);
      if (fs.existsSync(p)) return p;
    }
  return null;
}

/* ----------------------------------------------------------------- metin */
const T = {
  tr: {
    file: "Dosya", edit: "Düzen", view: "Görünüm", help: "Yardım",
    openDataset: "Veri Setini Aç",
    reloadData: "Veri Setini Yeniden Yükle",
    sep: "-", exit: "Çıkış", close: "Kapat",
    min: "Küçült", max: "Büyüt", restore: "Onarla",
    about: "Hakkında",
    aboutTitle: "VAG ABS Kodlama Hesaplayıcı",
    aboutBody:
      "VAG ABS Kodlama Hesaplayıcı\n" +
      "Sürüm 1.0.0\n\n" +
      "VAG ABS/ESP modüllerinin uzun kodlamasını okur ve üretir.\n\n" +
      "UYARI\n" +
      "Canlı araca yazmadan önce orijinal kodlamayı yedekleyin.\n" +
      "Kabul edilen kod bile arıza kaydı bırakabilir.\n\n" +
      "Yapımcı: Samet Muriç",
    helpTitle: "Nasıl Kullanılır",
    helpBody:
      "1. Aile seçin (modül tipi)\n" +
      "2. Çözümle sekmesinde kodunuzu yapıştırın\n" +
      "3. Üret sekmesinde araç ve VIN bilgilerini girin\n" +
      "4. Üretilen kodu aracınıza yazın\n\n" +
      "UYARI\n" +
      "Canlı araca yazmadan önce orijinal kodlamayı yedekleyin.\n" +
      "Kabul edilen kod bile arıza kaydı bırakabilir.",
    dataOpenFail: "Veri seti dosyası bulunamadı:\n",
    dataOpenDone: "Veri seti klasörü açıldı.",
  },
  en: {
    file: "File", edit: "Edit", view: "View", help: "Help",
    openDataset: "Open Dataset Folder",
    reloadData: "Reload Dataset",
    exit: "Exit", close: "Close",
    min: "Minimize", max: "Maximize", restore: "Restore",
    about: "About",
    aboutTitle: "VAG ABS Coding Calculator",
    aboutBody:
      "VAG ABS Coding Calculator\n" +
      "Version 1.0.0\n\n" +
      "Reads and generates long codings for VAG ABS/ESP modules.\n\n" +
      "WARNING\n" +
      "Back up the original coding before writing to a vehicle.\n" +
      "Even an accepted coding may leave fault codes.\n\n" +
      "Yapımcı: Samet Muriç",
    helpTitle: "How to use",
    helpBody:
      "1. Select the family (module type)\n" +
      "2. Paste your code in the Decode tab\n" +
      "3. Enter vehicle and VIN in the Generate tab\n" +
      "4. Write the generated code to your vehicle\n\n" +
      "WARNING\n" +
      "Back up the original coding before writing to a vehicle.\n" +
      "Even an accepted coding may leave fault codes.",
    dataOpenFail: "Dataset file not found:\n",
    dataOpenDone: "Dataset folder opened.",
  },
};

/* ----------------------------------------------------------------- pencere */
function createWindow() {
  win = new BrowserWindow({
    width: 1340,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    frame: false,               // ozel baslik cubugu
    titleBarStyle: "hidden",
    backgroundColor: "#0d1117",
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,           // preload kullanilacagi icin
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  win.once("ready-to-show", () => {
    win.show();
    if (isDev) win.webContents.openDevTools({ mode: "detach" });
  });

  // pencere durumu IPC ile kontrol edilir
  win.on("maximize", () => send("win:state", { maximized: true }));
  win.on("unmaximize", () => send("win:state", { maximized: false }));

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (isDev && devUrl) win.loadURL(devUrl);
  else win.loadFile(path.join(__dirname, "..", "dist", "index.html"));

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
}

function send(channel, payload) {
  if (win && !win.isDestroyed() && win.webContents) win.webContents.send(channel, payload);
}

function buildMenu() {
  const L = T[uiLang] || T.tr;
  const template = [
    ...(isMac ? [{ role: "appMenu" }] : []),
    {
      label: L.file,
      submenu: [
        {
          label: L.openDataset,
          click() {
            const p = findExternalDataset() || datasetPaths();
            if (!p) {
              dialog.showMessageBox(win, {
                type: "error",
                title: L.openDataset,
                message: L.dataOpenFail + "\n" + path.join(__dirname, "..", "src", "data"),
              });
              return;
            }
            // dosyayi varsayilan uygulamada ac
            shell.openPath(p).then((err) => {
              if (err) {
                // acilamazsa klasoru goster
                shell.showItemInFolder(p);
              }
            });
          },
        },
        {
          label: L.reloadData,
          click() {
            send("data:reload");
          },
        },
        { type: "separator" },
        isMac ? { role: "close", label: L.close } : { role: "quit", label: L.exit },
      ],
    },
    { role: "editMenu", label: L.edit },
    {
      label: L.view,
      submenu: [
        { role: "resetZoom", label: "100%" },
        { role: "zoomIn", label: "+" },
        { role: "zoomOut", label: "-" },
        { type: "separator" },
        { role: "togglefullscreen", label: L.max },
      ],
    },
    {
      label: L.help,
      submenu: [
        {
          label: L.helpTitle,
          click() {
            dialog.showMessageBox(win, {
              type: "info",
              title: L.helpTitle,
              message: L.aboutTitle,
              detail: L.helpBody,
              buttons: ["OK"],
            });
          },
        },
        {
          label: L.about,
          click() {
            dialog.showMessageBox(win, {
              type: "info",
              title: L.about,
              message: L.aboutTitle,
              detail: L.aboutBody,
              buttons: ["OK"],
            });
          },
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ------------------------------------------------------------------- IPC */
ipcMain.handle("win:minimize", () => win?.minimize());
ipcMain.handle("win:maximize", () => {
  if (!win) return false;
  if (win.isMaximized()) { win.unmaximize(); return false; }
  win.maximize();
  return true;
});
ipcMain.handle("win:close", () => win?.close());
ipcMain.handle("win:isMaximized", () => !!win?.isMaximized());
ipcMain.handle("data:path", () => findExternalDataset() || datasetPaths());
ipcMain.handle("data:read", () => {
  const p = findExternalDataset() || datasetPaths();
  if (!p) return null;
  try {
    return { path: p, raw: fs.readFileSync(p, "utf8") };
  } catch (e) {
    return { path: p, error: String(e) };
  }
});
ipcMain.on("ui:lang", (_e, lang) => {
  uiLang = lang === "en" ? "en" : "tr";
  buildMenu();
  if (win) win.setTitle(uiLang === "en" ? "VAG ABS Coding Calculator" : "VAG ABS Kodlama Hesaplayıcı");
});

/* ------------------------------------------------------------------ main */
nativeTheme.themeSource = "dark";

app.whenReady().then(() => {
  uiLang = "tr";
  createWindow();
  buildMenu();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});
