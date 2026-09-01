// Electron main process for Primordial Life
const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

app.whenReady().then(createWindow);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Primordial Life",
    backgroundColor: "#000000",
    autoHideMenuBar: true,
    webPreferences: {
      // local offline app; renderer uses require() for the sim modules
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "..", "src", "index.html"));

  win.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    if (input.key === "F11") {
      win.setFullScreen(!win.isFullScreen());
    } else if (input.key === "Escape") {
      if (win.isFullScreen()) win.setFullScreen(false);
      else app.quit();
    }
  });
}

app.on("window-all-closed", () => app.quit());
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
