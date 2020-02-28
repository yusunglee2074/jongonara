import { INaverId } from '../store/Store'
import { ipcRenderer } from 'electron';

export const loginNaver = async (naverIds: Array<INaverId>) => {
  return await ipcRenderer.invoke('loginNaver', naverIds);
};
