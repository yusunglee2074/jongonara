import * as puppeteer from 'puppeteer';
import { PUPPETEER_BROWSER_OPTIONS_ARGS } from '../utils/constants';
import { ipcMain } from 'electron';

const mainIPC = () => {
  let browser;

  ipcMain.on('initBrowser', async (event: any) => {
    const env = process.env.NODE_ENV;

    const getChromiumExecutePath = () => {
      if (env !== 'development') {
        return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
      } else {
        const text = puppeteer
          .executablePath()
          .replace('app.asar', 'app.asar.unpacked/node_modules/puppeteer');
        return text.replace('/dist', '/node_modules/puppeteer');
      }
    };

    const options = {
      args: PUPPETEER_BROWSER_OPTIONS_ARGS,
      ignoreHTTPSErrors: true,
      userDataDir: './tmp',
      headless: false
    };


    try {
      browser = await puppeteer.launch({
        ...options,
        executablePath: getChromiumExecutePath()
      });
      console.log(browser);
      event.returnValue = 'ok';
    } catch (e) {
      console.log(e)
      event.returnValue = e;
    }
  });
};

export default mainIPC;
