import { ipcRenderer } from "electron"

export const launchBrowser = () => {
  return ipcRenderer.sendSync('initBrowser');
}
