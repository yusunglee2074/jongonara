import { INaverId, ISetting, ITemplate, IWorking } from '../store/Store'
import { ipcRenderer } from 'electron';
import { format } from 'date-fns';

export const loginNaver = async (naverIds: Array<INaverId>) => {
  return await ipcRenderer.invoke('loginNaver', naverIds);
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

export const run = async (workings: Array<IWorking>, templates: Array<ITemplate>, setting: ISetting) => {
  ipcRenderer.on('logs', async (_e, ...args) => {
    console.log(args, '로그 듣기');
  });
  return ipcRenderer.invoke('run', workings, templates, setting);
};

export const stop = async () => {
  await ipcRenderer.invoke('stop');
  ipcRenderer.removeListener('logs', (...args) => {
    console.log(args, '끝')
  });
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
