import * as puppeteer from 'puppeteer';
import { Browser, ElementHandle, Page } from 'puppeteer';
import { PUPPETEER_BROWSER_OPTIONS_ARGS } from '../utils/constants';
import { ipcMain } from 'electron';
import { ILog, INaverId, ISetting, ITemplate, IWorking } from '../store/Store';
import errorCodes from '../utils/errorCodes';
import { win } from '../main';

const env = process.env.NODE_ENV;

let browsers: any = {};

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
      if (isWin) {
        const text = puppeteer
          .executablePath()
          .replace('app.asar', 'app.asar.unpacked/node_modules/puppeteer');
        return text.replace('\\dist', '\\node_modules\\puppeteer');
      } else {
        const text = puppeteer
          .executablePath()
          .replace('app.asar', 'app.asar.unpacked/node_modules/puppeteer');
        return text.replace('/dist', '/node_modules/puppeteer');
      }
    }
  };

  const options = {
    args: PUPPETEER_BROWSER_OPTIONS_ARGS,
    ignoreHTTPSErrors: true
  };

  ipcMain.handle(
    'loginNaver',
    async (_e: any, naverIds: Array<INaverId>): Promise<any> => {
      const createPage = async (naverId: string, password: string) => {
        try {
          const browser = await puppeteer.launch({
            ...options,
            executablePath: getChromiumExecutePath(),
            headless: true
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

          return { id: naverId, page, browser, isLoggedIn, password };
        } catch (err) {
          console.log(err);
          console.log(err.message);
          console.log('브라우저 런칭 실패!');
          throw Error(err);
        }
      };

      const promiseArr = [];

      for (let i = 0; i < Object.keys(browsers).length; i++) {
        const key = Object.keys(browsers)[i];
        const browser = browsers[key].browser;
        promiseArr.push(browser.close());
      }

      await Promise.all(promiseArr);
      promiseArr.length = 0;
      browsers = {};

      for (let i = 0; i < naverIds.length; i++) {
        const { id, password } = naverIds[i];
        if (!browsers[id]) promiseArr.push(createPage(id, password));
        else await browsers[id].page.reload();
      }

      try {
        const result = await Promise.all(promiseArr);
        const loginFailIds: Array<any> = [];
        result.map(({ id, page, browser, isLoggedIn, password }) => {
          if (!isLoggedIn) {
            loginFailIds.push(id);
            browser.close();
          } else {
            browsers = {
              ...browsers,
              [id]: { page, browser, id, password } as {
                page: Page;
                id: string;
                password: string;
                browser: Browser;
              }
            };
          }
        });

        // 이미지 업로드용 브라우저 하나더 띄우자
        const firstLoggedInBrowser = browsers[Object.keys(browsers)[0]];
        const { id, password } = firstLoggedInBrowser;
        browsers.imageUpload = await createPage(id, password);
        const { page } = browsers.imageUpload;

        await initUploadImagePage(page);

        return loginFailIds;
      } catch (err) {
        throw Error(err);
      }
    }
  );

  ipcMain.handle('saveFile', async (_e: any, filePaths: Array<string>) => {
    try {
      return await uploadPhotoOnCafe(filePaths);
    } catch (e) {
      throw Error(e);
    }
  });
  ipcMain.handle('getCafeBoards', async (_e: any, naverId: string, cafeUrl: string) => {
    const getNames = async (page: Page, handler: ElementHandle) => {
      const imgHandler = await handler.$('img');
      const aHandler = await handler.$('a');
      const name = await page.evaluate(el => el.innerText, aHandler);
      const url = await page.evaluate(el => el.href, aHandler);
      // 만약 게시판이 링크일 경우
      if (url.indexOf('ArticleList') === -1) {
        return {};
      }
      const isTradeBoard = await page.evaluate(el => {
        return el.className.indexOf('ico-market') > -1;
      }, imgHandler);
      return { name, url, isTradeBoard };
    };

    try {
      const { page } = getLoggedBrowser(naverId);
      const boardNames: Array<any> = [];
      await Promise.all([page.waitForNavigation(), page.goto(cafeUrl)]);

      const boardLiElementHandlers = await page.$$('ul.cafe-menu-list li');
      for (const liHandler of boardLiElementHandlers) {
        boardNames.push(await getNames(page, liHandler));
      }

      return boardNames.filter(el => Object.keys(el).length > 0);
    } catch (e) {
      throw Error(e);
    }
  });

  ipcMain.handle(
    'run',
    async (_: any, workings: Array<IWorking>, templates: Array<ITemplate>, setting: ISetting) => {
      console.log(workings, templates, setting);

      const sendLogToRenderer = (log: ILog) => {
        // createdAt: string;
        // naverId: string;
        // type: string;
        // text: string;
        // workingId: string;
        win?.webContents.send('logs', { ...log, createdAt: new Date() });
      };

      const write = async (naverId: string, working: IWorking) => {
        sendLogToRenderer({ text: '작업을 준비 중 입니다.', type: '정보' });
        const [template] = templates.filter(el => el.title === working.templateTitle);

        for (let i = 0; i < working.boardNames.length; i++) {
          const { name, url, isTradeBoard } = working.boardNames[i];

          const { page }: { page: Page } = browsers[naverId];
          await page.goto(url);
          page.on('dialog', async dialog => {
            console.log(dialog.message());
            await dialog.dismiss();
            // 글쓰기 버튼 클릭
            const writeButtonHandler = await page.waitForSelector('.cafe-write-btn a', {
              visible: true
            });
            await writeButtonHandler?.click();

            await page.waitForSelector('iframe');
            const iframeHandler = await page.$('div#main-area iframe');
            const frame = await iframeHandler?.contentFrame();
            if (!frame) throw Error('에러발생');
            const titleInputHandler = await frame.$('input#subject');
            await frame.evaluate(el => (el.value = template.title), titleInputHandler);

            if (isTradeBoard) {
              const saleBtnHandler = await frame.$('button#sale_direct');
              saleBtnHandler?.click();

              const nPayBtnHandler = await frame.$('#inputSwitch');
              nPayBtnHandler?.click();

              const saleCostInputHandler = await frame.$('#sale_cost');
              await frame.evaluate(el => (el.value = template.price), saleCostInputHandler);

              if (!template.exposePhoneNumber) {
                const exposeNumInputHandler = await frame.$('#sale_open_phone');
                exposeNumInputHandler?.click();
                if (template.useTempPhoneNumber) {
                  const useTempNumInputHandler = await frame.$('#sale_otn_use');
                  useTempNumInputHandler?.click();
                }
              }
            }

            console.log(name);
            // const getFirstImgOnContent = (templateText: string) => {
            //   // "<p><img width="740" src="https://cafefiles.pstatic.net/MjAyMDAzMjRfMzQg/MDAxNTg1MDMyNTA4MjI0.U0w9y3s8hXl5DzV6PappeRPtWUvMuH9wv4iYLcGdj_gg.XYMZAhuUMCagTc4X2yw38hNCH3EX43RuPioMvNDvCqog.JPEG/6517390_1.jpg">'<br></p><p><br></p><p><br></p><p>이렇게저렇게<img width="740" src="https://cafefiles.pstatic.net/MjAyMDAzMjRfOSAg/MDAxNTg1MDMyNTE5OTc2.EfhKOvARdUqyhl9a3gkmqkYEBugh_3C4eTsoiFwJ49Eg.k0GjgsAC7klxf7zmADXRi2EtxwH6Cs_qNqeCbSIGDxkg.JPEG/1405537904_1351563850_C0%CC%B7FBC2F7C5EBB0E802_%281%29.jpg"><img width="..."
            // };
          });
        }
      };

      console.log(write);

      // 현재 시간이 시간내인지 확인
      // const { runTimes } = setting;
      // setInterval();
    }
  );

  ipcMain.handle('getNaverCafes', async (_e: any, naverId: string) => {
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
          names = [...names, ...(await getNames(page, buttonHandler))];
        }
      }
      return names;
    } catch (e) {
      return e;
    }
  });
};

const getLoggedBrowser = (naverId?: string) => {
  const result = {} as { page: Page; browser: Browser };
  for (let i = 0; i < Object.keys(browsers).length; i++) {
    const id = Object.keys(browsers)[i];
    if (naverId && id === naverId) {
      result.page = browsers[id].page;
      result.browser = browsers[id].browser;
    } else if (!naverId) {
      result.page = browsers[id].page;
      result.browser = browsers[id].browser;
    }
  }
  if (!result.page || !result.browser) {
    throw Error(errorCodes['401']);
  }
  return result;
};

const uploadPhotoOnCafe = async (filePaths: Array<string>) => {
  // 글쓰기 페이지에서 사진 추가 팝업 띄움
  try {
    const { page, browser } = browsers.imageUpload;
    if (!page) {
      throw Error('이미지 업로드용 브라우저가 실행되지 않았습니다.');
    }

    await page.waitForSelector('iframe');
    const iframeHandler = await page.$('div#main-area iframe');
    const frame = await iframeHandler?.contentFrame();
    const imageUploadButtonHandler = await frame?.waitForSelector('li#iImage a');
    await imageUploadButtonHandler?.click();

    const newPagePromise: Promise<Page> = new Promise(resolve =>
      browser.once('targetcreated', async (target: any) => resolve(await target.page()))
    );
    const popupPage = await newPagePromise;
    await popupPage.waitForSelector('body > div.npe_alert_wrap.on > div', { visible: true });
    const modalCloseHandler = await popupPage.waitForSelector('.npe_alert_btn_close', {
      visible: true
    });
    await modalCloseHandler.click();
    await popupPage.waitForSelector('.npu_btn_icon.npu_btn_mypc', { visible: true });
    const [fileChooser] = await Promise.all([
      popupPage.waitForFileChooser(),
      popupPage.click('.npu_btn_icon.npu_btn_mypc') // some button that triggers file selection
    ]);
    await Promise.all([fileChooser.accept(filePaths), waitForNetworkIdle(page, 500, 0)]);

    // 업로드 기다림
    await popupPage.waitForSelector('body > div.npe_alert_wrap', { hidden: true });

    const finishUploadButtonHandler = await popupPage.$('button.npu_btn.npu_btn_submit');
    await Promise.all([
      finishUploadButtonHandler?.click(),
      waitForNetworkIdle(popupPage, 500, 0),
      waitForNetworkIdle(page, 500, 0)
    ]);

    await Promise.all([page.waitFor(200), waitForNetworkIdle(page, 500, 0)]);
    const editorFrameHandler = await frame?.$('td.read iframe');
    const editorFrame = await editorFrameHandler?.contentFrame();
    await editorFrame?.waitForSelector('body img');
    const imageHandlers = await editorFrame?.$$('body img');

    const result = [];
    for (const hdl of imageHandlers || []) {
      result.push(
        await editorFrame?.evaluate((el: HTMLImageElement) => {
          const src = el.src;
          el.remove();
          return src;
        }, hdl)
      );
    }

    return result;
  } catch (e) {
    throw Error(e.message);
  }
};

const initUploadImagePage = async (page: Page) => {
  // TODO: 카페 글쓰기 권한 없을 경우 다음 카페로 이동할 수 있게 해야함
  await Promise.all([
    page.goto('https://section.cafe.naver.com/cafe-home/mycafe/join'),
    waitForNetworkIdle(page, 500, 0)
  ]);

  const cafeLinkHandlers = await page.$$('a.cafe_name');
  const cafeUrl = await page.evaluate(el => el.href, cafeLinkHandlers[0]);
  // const writeable = false;

  // 카페 이동 후 글 쓰기 페이지까지 이동
  await Promise.all([
    page.goto(cafeUrl),
    waitForNetworkIdle(page, 500, 0),
    page.waitForNavigation({
      waitUntil: 'networkidle0'
    })
  ]);
  const writeButtonHandler = await page.waitForSelector('.cafe-write-btn a', { visible: true });
  await writeButtonHandler?.click();
};

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

export default mainIPC;
