import { INaverId } from '../store/Store'
import { ipcRenderer } from 'electron'
import { format } from 'date-fns'

export const loginNaver = async (naverIds: Array<INaverId>) => {
  return await ipcRenderer.invoke('loginNaver', naverIds);
};

export const getNaverCafes = async (naverId: string) => {
  return await ipcRenderer.invoke('getNaverCafes', naverId);
};

export const saveFile = async (blob: Blob) => {
  async function readFile(fileBlob: Blob): Promise<string> {
    return await new Promise((resolve) => {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        if (fileReader.result) {
          const buffer = Buffer.from(fileReader.result)
          const fileName: string = format(new Date(), 'yyyyMMddssSSS') //rename file
          resolve(ipcRenderer.invoke('saveFiles', fileName, buffer));
        }
      };
      fileReader.readAsArrayBuffer(fileBlob);
    });
  }

  try {
    return await readFile(blob);
  } catch (e) {
    throw Error(e);
  }
}


export const saveFiles = async (blobArr: Array<Blob>) => {

  const promiseArr: Array<Promise<any>> = [];
  for (let i = 0; i < blobArr.length; i++) {
    const blob = blobArr[i];
    let reader = new FileReader()
    reader.onload = function() {
      if (reader.readyState == 2 && reader.result) {
        const buffer = Buffer.from(reader.result)
        const fileName: string = format(new Date(), 'yyyyMMddssSSS') //rename file
        promiseArr.push(ipcRenderer.invoke('saveFiles', fileName, buffer));
      }
    }
    reader.readAsArrayBuffer(blob)
  }

  return await Promise.all(promiseArr);
};
