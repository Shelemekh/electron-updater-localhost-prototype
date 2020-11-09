const { app, BrowserWindow, ipcMain } = require('electron');
const {autoUpdater} = require("electron-updater");
const log = require('electron-log');

let mainWindow;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
// log.transports.file.level = 'info';
// log.transports.file.file = __dirname + 'log.log';
function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
  mainWindow.once('ready-to-show', () => {
   
    log.info('before trigger check updates ad notifications')
    autoUpdater.checkForUpdatesAndNotify();
  });
}

app.setAppUserModelId("com.example.ElectronAutoUpdate");
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (ev, info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (ev, err) => {
  sendStatusToWindow('Error in auto-updater.');
})
autoUpdater.on('download-progress', (ev, progressObj) => {
  sendStatusToWindow('Download progress...');
})
autoUpdater.on('update-downloaded', (ev, info) => {
  sendStatusToWindow('Update downloaded; will install in 5 seconds');
});

app.on('ready', () => {
  createWindow();
});

autoUpdater.on('update-downloaded', (ev, info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();  
  }, 5000)
})

app.on('ready', function()  {
  autoUpdater.checkForUpdates();
});

ipcMain.on('restart_app', () => {
 log.info("autoUpdater restart_app method run");
  autoUpdater.quitAndInstall();
});
