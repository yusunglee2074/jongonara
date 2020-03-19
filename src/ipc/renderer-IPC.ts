import { INaverId } from '../store/Store';
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
// export const saveFile = async (files: Array<File>) => {
//   async function readFile(file: File): Promise<any> {
//     return await new Promise(resolve => {
//       let fileReader = new FileReader();
//       fileReader.onload = () => {
//         if (fileReader.result) {
//           resolve(Buffer.from(fileReader.result));
//         }
//       };
//       fileReader.readAsArrayBuffer(file);
//     });
//   }
//
//   const bufferFiles: Array<any> = [];
//   for (const file of files) {
//     bufferFiles.push({
//       fileName: format(new Date(), 'yyyyMMddssSSS'),
//       buffer: await readFile(file)
//     });
//   }
//   return ipcRenderer.invoke('saveFile', bufferFiles);
// };

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
