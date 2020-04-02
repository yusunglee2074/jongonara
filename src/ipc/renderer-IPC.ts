import { getSettingsOnDB, INaverId, ISetting, ITemplate, IWorking } from '../store/Store';
import { ipcRenderer } from 'electron';
import { format } from 'date-fns';

export const loginNaver = async (naverIds: Array<INaverId>) => {
  const { debugMode } = await getSettingsOnDB();
  return await ipcRenderer.invoke('loginNaver', naverIds, debugMode);
};

export const getNaverCafes = async (naverId: string) => {
  return await ipcRenderer.invoke('getNaverCafes', naverId);
};

export const getCafeBoards = async (naverId: string, cafeUrl: string) => {
  return await ipcRenderer.invoke('getCafeBoards', naverId, cafeUrl);
};

export const saveFile = async (filePaths: Array<string>) => {
  return ipcRenderer.invoke('saveFile', filePaths);
};

export const getVersion = async () => {
  return await ipcRenderer.invoke('getVersion');
};

export const listenUpdateAvailable = (updateAvailableCB: Function, downloadedCB: Function) => {
  ipcRenderer.on('update-available', () => {
    ipcRenderer.removeAllListeners('update-available');
    updateAvailableCB();
  });
  ipcRenderer.on('update-downloaded', () => {
    ipcRenderer.removeAllListeners('update-downloaded');
    downloadedCB();
  });
}

export const restartApp = async () => {
  await ipcRenderer.invoke('restartApp');
}

export const run = async (
  workings: Array<IWorking>,
  templates: Array<ITemplate>,
  setting: ISetting,
  loggingCallbackFunc: Function
) => {
  ipcRenderer.on('logs', async (_e, log) => {
    loggingCallbackFunc(log);
  });
  // We pass through JSON because in Electron >= 8, IPC uses v8's structured clone algorithm and throws errors if
  // objects have functions
  const iLikeJson = (obj: object) => JSON.parse(JSON.stringify(obj));

  return ipcRenderer.invoke('run', iLikeJson(workings), iLikeJson(templates), iLikeJson(setting));
};

export const allStop = async () => {
  await ipcRenderer.invoke('stop');
  ipcRenderer.removeListener('logs', () => {});
};

export const saveFiles = async (blobArr: Array<Blob>) => {
  const promiseArr: Array<Promise<any>> = [];
  for (let i = 0; i < blobArr.length; i++) {
    const blob = blobArr[i];
    let reader = new FileReader();
    reader.onload = function() {
      if (reader.readyState == 2 && reader.result) {
        const buffer = Buffer.from(reader.result);
        const fileName: string = format(new Date(), 'yyyyMMddssSSS'); //rename file
        promiseArr.push(ipcRenderer.invoke('saveFiles', fileName, buffer));
      }
    };
    reader.readAsArrayBuffer(blob);
  }

  return await Promise.all(promiseArr);
};
