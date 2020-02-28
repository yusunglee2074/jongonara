import * as puppeteer from 'puppeteer';
import { PUPPETEER_BROWSER_OPTIONS_ARGS } from '../utils/constants';
import { ipcMain } from 'electron';
import { INaverId } from '../store/Store';

const env = process.env.NODE_ENV;

let pages: any = {};

const mainIPC = async () => {
  const getChromiumExecutePath = () => {
    if (env !== 'development') {
      return puppeteer
        .executablePath()
        .replace('app.asar', 'app.asar.unpacked')
        .replace('dist', '')
        //for mac
        .replace('//', '/')
        //for window
        .replace('\\\\', '\\');
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
    headless: false
  };

  ipcMain.handle('loginNaver', async (e: any, naverIds: Array<INaverId>) => {
    console.log(e);
    const createPage = async (naverId: string, password: string) => {
      try {
        const browser = await puppeteer.launch({
          ...options,
          executablePath: getChromiumExecutePath()
        });
        console.log(browser.isConnected(), '브라우저 런칭완료');
        const browserPages = await browser.pages();
        const page = browserPages[0];
        await page.goto('https://nid.naver.com/nidlogin.login');
        await page.waitForSelector('input[id="id"]');
        await page.waitFor(200);
        await page.$eval(
          'input[id="id"]',
          (e: Element, naverId) => {
            e.setAttribute('value', naverId);
          },
          naverId
        );
        await page.waitFor(200);
        await page.$eval(
          'input[id="pw"]',
          (e: Element, password) => {
            e.setAttribute('value', password);
          },
          password
        );
        await page.waitFor(200);
        await page.click('input[id="log.login"]');

        return { id: naverId, page, browser };
      } catch (err) {
        console.log(err);
        console.log(err.message);
        console.log('브라우저 런칭 실패!');
        throw Error(err);
      }
    };

    const promiseArr = [];
    for (let i = 0; i < naverIds.length; i++) {
      const { id, password } = naverIds[i];
      if (!pages[id]) promiseArr.push(createPage(id, password));
      else await pages[id].page.reload();
    }

    try {
      const result = await Promise.all(promiseArr);
      result.map(({ id, page, browser }) => {
        pages = { ...pages, [id]: { page, browser } };
      });
      return '성공';
    } catch (err) {
      return err.message;
    }
  });
};

export default mainIPC;
