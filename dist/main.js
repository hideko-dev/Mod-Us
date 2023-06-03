var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};

// src/main/main.ts
var import_electron9 = __toModule(require("electron"));

// src/main/registerWindowIPC.ts
var import_electron = __toModule(require("electron"));
function registerWindowIPC() {
  import_electron.ipcMain.on("window:minimize", (event) => {
    import_electron.BrowserWindow.fromWebContents(event.sender)?.minimize();
  });
  import_electron.ipcMain.on("window:menu", (event) => {
    import_electron.app.applicationMenu?.popup({window: import_electron.BrowserWindow.fromWebContents(event.sender)});
  });
  import_electron.ipcMain.on("window:show-releases", async () => {
    await import_electron.shell.openExternal("https://github.com/moritzruth/among-us-mod-manager/releases");
  });
}

// src/main/window.ts
var import_path4 = __toModule(require("path"));
var import_electron7 = __toModule(require("electron"));
var import_electron_window_state = __toModule(require("electron-window-state"));

// src/main/tray.ts
var import_electron2 = __toModule(require("electron"));
var tray = null;
function createTray(icon) {
  if (tray !== null)
    return;
  tray = new import_electron2.Tray(icon);
  tray.setToolTip("Mod Us is running in the background.\nIt is automatically closed when the game exits.");
  tray.on("click", () => {
    const window2 = getWindow();
    window2.show();
    if (window2.isMinimized())
      window2.restore();
    window2.focus();
  });
}
function destroyTray() {
  tray?.destroy();
  tray = null;
}

// src/main/manager/ipc.ts
var import_electron6 = __toModule(require("electron"));

// src/main/manager/gameInfo.ts
var import_path2 = __toModule(require("path"));
var import_fs_extra2 = __toModule(require("fs-extra"));
var import_electron_store = __toModule(require("electron-store"));
var import_electron3 = __toModule(require("electron"));

// src/main/manager/detectGameVersion.ts
var import_path = __toModule(require("path"));
var import_fs_extra = __toModule(require("fs-extra"));
async function detectGameVersion(directory) {
  const content = await import_fs_extra.default.readFile(import_path.default.resolve(directory, "./Among Us_Data/globalgamemanagers"), {encoding: "utf8"});
  const regex = /\d{4}\.\d{1,4}\.\d{1,4}/gu;
  regex.exec(content);
  const match = regex.exec(content);
  if (match !== null) {
    return match[0];
  }
  throw new Error("Among Us version could not be detected");
}

// src/main/manager/gameInfo.ts
var store = new import_electron_store.default();
var getOriginalGameDirectory = () => store.get("originalGameDirectory");
var setOriginalGameDirectory = (path) => store.set("originalGameDirectory", path);
var getDirectoryForInstallations = () => import_path2.default.resolve(store.get("originalGameDirectory"), "..");
var originalGameVersion;
var getOriginalGameVersion = () => originalGameVersion;
var isValidGameDirectory = async (path) => import_fs_extra2.default.pathExists(import_path2.default.resolve(path, "Among Us.exe"));
async function detectOriginalGameVersion() {
  if (!await import_fs_extra2.default.pathExists(getOriginalGameDirectory()))
    return false;
  originalGameVersion = await detectGameVersion(getOriginalGameDirectory());
  return true;
}
async function showOriginalGameDirectorySelectDialog(reason) {
  if (reason !== "user") {
    const options = {
      title: reason === "not-automatically" ? "Among Us could not be automatically detected." : "Among Us could not be found.",
      message: (reason === "not-automatically" ? "Among Us could not be automatically detected. " : "") + "Please select the directory which contains the game (Among Us.exe).\n\n",
      buttons: ["Cancel", "Select"],
      type: "error"
    };
    const {response} = await import_electron3.dialog.showMessageBox(options);
    if (response === 0)
      import_electron3.app.exit(0);
  }
  while (true) {
    const {filePaths} = await import_electron3.dialog.showOpenDialog({
      properties: ["openDirectory", "dontAddToRecent"],
      buttonLabel: "Select",
      title: "Game directory selection"
    });
    if (filePaths.length === 0) {
      if (reason === "user")
        return;
      import_electron3.app.exit(0);
    } else {
      const [path] = filePaths;
      if (await isValidGameDirectory(path)) {
        store.set("originalGameDirectory", path);
        import_electron3.app.relaunch();
        import_electron3.app.exit();
        return;
      }
      const options = {
        type: "error",
        title: "Among Us could not be found.",
        message: "Please try again.",
        buttons: ["Cancel", "Retry"]
      };
      const {response} = await import_electron3.dialog.showMessageBox(options);
      if (response === 0) {
        if (reason === "user")
          return;
        import_electron3.app.exit();
      }
    }
  }
}
async function doStartupCheck() {
  if (store.has("originalGameDirectory")) {
    if (!await isValidGameDirectory(getOriginalGameDirectory()))
      await showOriginalGameDirectorySelectDialog("invalid");
  } else {
    const defaultPath = import_path2.default.resolve("C:\\Program Files (x86)\\Steam\\steamapps\\common", "./Among Us");
    if (await isValidGameDirectory(defaultPath))
      setOriginalGameDirectory(defaultPath);
    else
      await showOriginalGameDirectorySelectDialog("not-automatically");
  }
}

// src/main/manager/util.ts
function send(channel, ...arguments_) {
  getWindow().webContents.send(channel, ...arguments_);
}

// src/main/manager/remoteMods.ts
var import_got = __toModule(require("got"));
var import_electron4 = __toModule(require("electron"));
var MODS_URL = process.env.MODS_LIST_URL ?? "https://raw.githubusercontent.com/Hideko-Dev/Mod-Us-RemoteMods/main/mods.json";
var remoteMods = [];
var getRemoteMods = () => remoteMods;
var getRemoteMod = (id) => remoteMods.find((mod) => mod.id === id);
async function fetchRemoteMods() {
  try {
    remoteMods = (await (0, import_got.default)(MODS_URL, {responseType: "json"})).body;
  } catch {
    import_electron4.dialog.showErrorBox("Mods could not be loaded.", "Please check your internet connection.");
    import_electron4.app.exit(1);
    throw new Error("Mods could not be fetched.");
  }
}

// src/main/manager/installedMods.ts
var import_path3 = __toModule(require("path"));
var import_fs_extra3 = __toModule(require("fs-extra"));
var import_download = __toModule(require("download"));
var import_decompress = __toModule(require("decompress"));
var import_execa = __toModule(require("execa"));
var import_electron5 = __toModule(require("electron"));
var import_semver = __toModule(require("semver"));

// src/main/constants.ts
var isDevelopment = false;
var MANAGER_VERSION = "1.3.0";

// src/main/manager/progress.ts
var currentProgressState = {
  title: "",
  text: "",
  finished: true
};
function updateProgress(state) {
  currentProgressState = {...currentProgressState, ...state};
  send("manager:progress", currentProgressState);
}

// src/main/manager/installedMods.ts
var installedMods = [];
var getInstalledMods = () => installedMods;
var getInstalledMod = (id) => installedMods.find((mod) => mod.id === id);
async function discoverInstalledMods() {
  const directoryNames = await import_fs_extra3.default.readdir(getDirectoryForInstallations());
  installedMods = (await Promise.all(directoryNames.map(async (name) => {
    const directory = import_path3.default.resolve(getDirectoryForInstallations(), name);
    const dataPath = import_path3.default.resolve(directory, "aumm.json");
    if (await import_fs_extra3.default.pathExists(dataPath)) {
      const data = await import_fs_extra3.default.readJson(dataPath);
      const amongUsVersion = await detectGameVersion(directory);
      return {path: directory, amongUsVersion, ...data};
    }
    return null;
  }))).filter((mod) => mod !== null);
}
var activeModId = null;
var isGameRunning = () => activeModId !== null;
async function saveInstalledMod(mod) {
  const {path, ...data} = mod;
  await import_fs_extra3.default.writeJson(import_path3.default.resolve(path, "aumm.json"), data);
}
async function installMod(remoteMod) {
  const alreadyInstalledIndex = installedMods.findIndex((mod) => mod.id === remoteMod.id);
  if (alreadyInstalledIndex !== -1)
    installedMods.splice(alreadyInstalledIndex, 1);
  const directory = import_path3.default.resolve(getDirectoryForInstallations(), `Among Us (${remoteMod.title})`);
  updateProgress({title: "Install: " + remoteMod.title, text: "Preparing", finished: false});
  if (await import_fs_extra3.default.pathExists(directory))
    await import_fs_extra3.default.remove(directory);
  updateProgress({text: "Copying game files"});
  await import_fs_extra3.default.copy(getOriginalGameDirectory(), directory);
  const request = (0, import_download.default)(remoteMod.downloadURL, directory, {filename: "__archive"});
  request.on("downloadProgress", ({percent}) => {
    updateProgress({text: `Downloading (${Math.trunc(percent * 100)}%)`});
  });
  await request;
  updateProgress({text: "Extracting"});
  const archivePath = import_path3.default.resolve(directory, "__archive");
  await (0, import_decompress.default)(archivePath, directory);
  updateProgress({text: "Cleaning up"});
  await import_fs_extra3.default.remove(archivePath);
  const installedMod = {
    id: remoteMod.id,
    version: remoteMod.version,
    path: directory,
    amongUsVersion: getOriginalGameVersion()
  };
  updateProgress({text: "Saving metadata"});
  await saveInstalledMod(installedMod);
  installedMods.push(installedMod);
  sendUIModData();
  updateProgress({finished: true});
}
async function startMod(id) {
  const installedMod = getInstalledMod(id);
  const process2 = (0, import_execa.default)(import_path3.default.resolve(installedMod.path, "Among Us.exe"), {detached: false, stdout: "ignore", stderr: "ignore", windowsHide: false});
  activeModId = installedMod.id;
  send("manager:game-started", installedMod.id);
  process2.on("exit", async () => {
    activeModId = null;
    const window2 = getWindow();
    send("manager:game-stopped");
    if (!window2.isVisible())
      import_electron5.app.exit();
  });
}
async function installModIfMinManagerVersionSatisfied(id) {
  const remoteMod = getRemoteMod(id);
  if (import_semver.default.lt(MANAGER_VERSION, remoteMod.minManagerVersion))
    return false;
  await installMod(remoteMod);
  return true;
}
async function uninstallMod(id) {
  const remoteMod = getRemoteMod(id);
  const installedMod = getInstalledMod(id);
  updateProgress({
    title: `Uninstall: ${remoteMod.title}`,
    text: "Removing game files",
    finished: false
  });
  await import_fs_extra3.default.remove(installedMod.path);
  updateProgress({finished: true});
  installedMods.splice(installedMods.findIndex((mod) => mod.id === remoteMod.id), 1);
  sendUIModData();
}

// src/main/manager/ipc.ts
var getUIModData = () => getRemoteMods().map((remoteMod) => {
  const installedMod = getInstalledMods().find((mod) => mod.id === remoteMod.id);
  return {
    id: remoteMod.id,
    title: remoteMod.title,
    author: remoteMod.author,
    installedVersion: installedMod?.version ?? null,
    projectURL: remoteMod.projectURL,
    outdated: installedMod === void 0 ? false : installedMod.version !== remoteMod.version,
    notInstallableReason: installedMod !== void 0 && installedMod.version === remoteMod.version || remoteMod.amongUsVersion === getOriginalGameVersion() ? null : `Among Us v${remoteMod.amongUsVersion}s is required for this mod.`
  };
});
function sendUIModData() {
  send("manager:mods-updated", getUIModData());
}
function registerIPC() {
  import_electron6.ipcMain.handle("manager:get-mods", () => getUIModData());
  import_electron6.ipcMain.handle("manager:install", async (event, id) => installModIfMinManagerVersionSatisfied(id));
  import_electron6.ipcMain.handle("manager:uninstall", async (event, id) => uninstallMod(id));
  import_electron6.ipcMain.handle("manager:start", async (event, id) => startMod(id));
}

// src/main/manager/index.ts
function initiateManager() {
  registerIPC();
  Promise.all([
    discoverInstalledMods(),
    fetchRemoteMods()
  ]).then(() => {
    sendUIModData();
  });
}

// src/main/window.ts
var window;
function getWindow() {
  return window;
}
async function createWindow() {
  const state = (0, import_electron_window_state.default)({
    maximize: false,
    fullScreen: false
  });
  const icon = import_electron7.nativeImage.createFromPath(import_path4.default.resolve(__dirname, isDevelopment ? "../src/static" : "./renderer", "icon.png"));
  window = new import_electron7.BrowserWindow({
    x: state.x,
    y: state.y,
    show: false,
    frame: false,
    backgroundColor: "#171717",
    height: 700,
    width: 450,
    resizable: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true
    },
    icon
  });
  state.manage(window);
  window.webContents.on("will-navigate", (event, rawUrl) => {
    event.preventDefault();
    import_electron7.shell.openExternal(rawUrl);
  });
  window.on("hide", () => createTray(icon));
  window.on("show", () => destroyTray());
  window.on("close", (event) => {
    if (isGameRunning()) {
      event.preventDefault();
      window.hide();
    } else
      import_electron7.app.exit();
  });
  if (isDevelopment) {
    await window.loadURL("http://localhost:3000");
    window.setSize(1e3, 700);
    window.webContents.openDevTools({mode: "right"});
  } else {
    await window.loadFile(import_path4.default.resolve(__dirname, "./renderer/index.html"));
  }
  window.show();
}

// src/main/handleSquirrelEvents.ts
var import_child_process = __toModule(require("child_process"));
var import_path5 = __toModule(require("path"));
var import_electron8 = __toModule(require("electron"));
var spawn = (command, arguments_) => {
  let spawnedProcess;
  try {
    spawnedProcess = import_child_process.default.spawn(command, arguments_, {detached: true});
  } catch {
  }
  return spawnedProcess;
};
function handleSquirrelEvents() {
  if (isDevelopment || process.argv.length === 1)
    return false;
  const appFolder = import_path5.default.resolve(process.execPath, "..");
  const rootAtomFolder = import_path5.default.resolve(appFolder, "..");
  const updateDotExe = import_path5.default.resolve(import_path5.default.join(rootAtomFolder, "Update.exe"));
  const exeName = import_path5.default.basename(process.execPath);
  const spawnUpdate = (...arguments_) => spawn(updateDotExe, arguments_);
  const [, squirrelEvent] = process.argv;
  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated":
      spawnUpdate("--createShortcut", exeName);
      setTimeout(() => import_electron8.app.quit(), 1e3);
      return true;
    case "--squirrel-uninstall":
      spawnUpdate("--removeShortcut", exeName);
      setTimeout(() => import_electron8.app.quit(), 1e3);
      return true;
    case "--squirrel-obsolete":
      import_electron8.app.quit();
      return true;
  }
  return false;
}

// src/main/main.ts
if (!handleSquirrelEvents()) {
  if (!import_electron9.app.requestSingleInstanceLock()) {
    console.log("Another instance is already running. Quitting...");
    import_electron9.app.quit();
  }
  import_electron9.app.on("ready", async () => {
    await doStartupCheck();
    await detectOriginalGameVersion();
    import_electron9.app.applicationMenu = import_electron9.Menu.buildFromTemplate([
      {label: `Manager: ${MANAGER_VERSION}`, enabled: false},
      {label: `Among Us: ${getOriginalGameVersion()}`, enabled: false},
      {type: "separator"},
      {
        label: "Select the game directory",
        click() {
          showOriginalGameDirectorySelectDialog("user");
        }
      },
      {
        label: "Open the installations directory",
        click() {
          import_electron9.shell.openPath(getDirectoryForInstallations());
        }
      },
      {
        label: "Show devtools",
        click() {
          getWindow().webContents.openDevTools({mode: "detach"});
        },
        accelerator: "Ctrl+Shift+I"
      }
    ]);
    initiateManager();
    registerWindowIPC();
    await createWindow();
  });
  import_electron9.app.on("second-instance", () => {
    const window2 = getWindow();
    window2.show();
    if (window2.isMinimized())
      window2.restore();
    window2.focus();
  });
}
