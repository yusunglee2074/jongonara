import * as puppeteer from 'puppeteer';
// import { app } from 'electron';
import { PUPPETEER_BROWSER_OPTIONS_ARGS } from '../utils/constants';
import { ipcMain, app } from 'electron';
import { INaverId } from '../store/Store';
import * as fs from 'fs';
import * as path from 'path';
import { Browser, ElementHandle, Page } from 'puppeteer';
// import * as path from 'path'
// import { format } from 'date-fns';
// import * as fs from 'fs'

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

  ipcMain.handle(
    'loginNaver',
    async (_e: any, naverIds: Array<INaverId>): Promise<any> => {
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
            loginFailIds.push(id);
            browser.close();
          } else {
            pages = { ...pages, [id]: { page, browser } };
          }
        });
        return loginFailIds;
      } catch (err) {
        throw Error(err);
      }
    }
  );

  ipcMain.handle('saveFiles', async (_e: any, fileName: string, buffer: Buffer) => {
    const imagePath = path.join(app.getPath('userData'), 'images', fileName + '.jpg');
    fs.mkdirSync(path.join(app.getPath('userData'), 'images'), { recursive: true });
    fs.writeFileSync(imagePath, buffer);
    return imagePath;
  });

  ipcMain.handle('getNaverCafes', async (_e: any, naverId: string) => {
    const waitForNetworkIdle = (page: Page, timeout: number, maxInflightRequests = 0) => {
      page.on('request', onRequestStarted);
      page.on('requestfinished', onRequestFinished);
      page.on('requestfailed', onRequestFinished);

      let inflight = 0;
      let fulfill: any;
      let promise = new Promise(x => (fulfill = x));
      let timeoutId = setTimeout(onTimeoutDone, timeout);
      return promise;

      function onTimeoutDone() {
        page.removeListener('request', onRequestStarted);
        page.removeListener('requestfinished', onRequestFinished);
        page.removeListener('requestfailed', onRequestFinished);
        fulfill();
      }

      function onRequestStarted() {
        ++inflight;
        if (inflight > maxInflightRequests) clearTimeout(timeoutId);
      }

      function onRequestFinished() {
        if (inflight === 0) return;
        --inflight;
        if (inflight === maxInflightRequests) timeoutId = setTimeout(onTimeoutDone, timeout);
      }
    };

    const getNames = async (page: Page, buttonHandler?: ElementHandle) => {
      try {
        if (buttonHandler)
          await Promise.all([buttonHandler.click(), waitForNetworkIdle(page, 500, 0)]);
        await page.waitForSelector('a.cafe_name', { visible: true });
        const names = [];
        const aTagHandlers = await page.$$('a.cafe_name');
        for (const aTagHandler of aTagHandlers) {
          const name = await page.evaluate(el => el.innerText, aTagHandler);
          const url = await page.evaluate(el => el.href, aTagHandler);
          names.push({ url, name });
        }
        return names;
      } catch (e) {
        throw Error(e);
      }
    };
    try {
      const { page } = getLoggedBrowser(naverId);
      await page.goto('https://section.cafe.naver.com/cafe-home/mycafe/join');
      let names: Array<any> = [];

      const paginationElementHandler = await page.$('.common_page');
      if (paginationElementHandler) {
        const paginationButtonHandlers = await paginationElementHandler.$$('button');

        for (const buttonHandler of paginationButtonHandlers) {
          console.log(await page.evaluate(el => el.innerText, buttonHandler));
          console.log('아우터포 시작');
          names = [...names, ...(await getNames(page, buttonHandler))];
          console.log('아우터포 종료');
        }
      }
      return names;
    } catch (e) {
      throw Error(e);
    }
  });
};

const getLoggedBrowser = (naverId: string) => {
  const result = {} as { page: Page; browser: Browser };
  for (let i = 0; i < Object.keys(pages).length; i++) {
    const id = Object.keys(pages)[i];
    if (id === naverId) {
      result.page = pages[id].page;
      result.browser = pages[id].browser;
    }
  }
  if (!result.page || !result.browser) {
    throw Error('해당 브라우저가 없습니다.');
  }
  return result;
};

export default mainIPC;
