import * as puppeteer from 'puppeteer';
import { PUPPETEER_BROWSER_OPTIONS_ARGS } from '../utils/constants';
import { ipcMain } from 'electron';
import { INaverId } from '../store/Store';

const env = process.env.NODE_ENV;

let pages: any = {};

const isWin = process.platform === 'win32';

const mainIPC = async () => {
  const getChromiumExecutePath = () => {
    if (env !== 'development') {
      if (isWin) {
        return puppeteer
          .executablePath()
          .replace('app.asar', 'app.asar.unpacked')
          .replace('dist', 'node_modules\\puppeteer');
      } else {
        return puppeteer
          .executablePath()
          .replace('app.asar', 'app.asar.unpacked')
          .replace('dist', 'node_modules/puppeteer');
      }
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

  ipcMain.handle('loginNaver', async (_e: any, naverIds: Array<INaverId>): Promise<any> => {
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
        await page.waitForNavigation();

        const isLoggedIn = page.url().indexOf('www.naver.com') > -1;

        return { id: naverId, page, browser, isLoggedIn };
      } catch (err) {
        console.log(err);
        console.log(err.message);
        console.log('브라우저 런칭 실패!');
        throw Error(err);
      }
    };

    const promiseArr = [];

    for (let i = 0; i < Object.keys(pages).length; i++) {
      const key = Object.keys(pages)[i];
      const browser = pages[key].browser;
      promiseArr.push(browser.close());
    }

    await Promise.all(promiseArr);
    promiseArr.length = 0;
    pages = {};

    for (let i = 0; i < naverIds.length; i++) {
      const { id, password } = naverIds[i];
      if (!pages[id]) promiseArr.push(createPage(id, password));
      else await pages[id].page.reload();
    }

    try {
      const result = await Promise.all(promiseArr);
      const loginFailIds: Array<any> = [];
      result.map(({ id, page, browser, isLoggedIn }) => {
        if (!isLoggedIn) {
          loginFailIds.push(id)
          browser.close();
        } else {
          pages = { ...pages, [id]: { page, browser } };
        }
      });
      return loginFailIds;
    } catch (err) {
      throw Error(err);
    }
  });
};

export default mainIPC;
