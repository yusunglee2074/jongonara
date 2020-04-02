import { app, BrowserWindow, Menu } from 'electron';
import * as path from 'path';
import * as url from 'url';
import mainIPC from './ipc/main-IPC';
const { autoUpdater } = require('electron-updater');

// const serviceAccount = require("../jongonara-10b67-firebase-adminsdk-nevug-5bdda1479f.json");
Menu.setApplicationMenu(null)

export let win: BrowserWindow | null;

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (process.env.NODE_ENV !== 'production') {
    await installExtensions();
  }

  win = new BrowserWindow({
    title: '네이버 카페 자동 등록기',
    width: 1400,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  });

  // Main IPC 설정
  await mainIPC();

  // 프로그램 이름 변경 방지
  win.on('page-title-updated', function(e) {
    e.preventDefault()
  });

  if (process.env.NODE_ENV !== 'production') {
    win.loadURL(`http://localhost:2003`);
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    // Open DevTools
    win.webContents.openDevTools();
  }

  win.on('closed', () => {
    win = null;
    app.quit();
  });

};

app.on('ready', async () => {
  await createWindow();
  console.log("##############실행은 되냐?")
  await autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  win = null;
  app.quit();
});

app.on('activate', async () => {
  if (win === null) {
    await createWindow();
  }
});

autoUpdater.on('updateAvailable', () => {
  console.log("##############어베일")
  win?.webContents.send('updateAvailable');
});
autoUpdater.on('updateDownloaded', () => {
  console.log("##############다운로디드")
  win?.webContents.send('updateDownloaded');
});
