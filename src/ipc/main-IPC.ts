import * as puppeteer from 'puppeteer';
import { Browser, ElementHandle, Page } from 'puppeteer';
import { PUPPETEER_BROWSER_OPTIONS_ARGS } from '../utils/constants';
import { app, ipcMain } from 'electron';
import { INaverId, ISetting, ITemplate, IWorking } from '../store/Store';
import errorCodes from '../utils/errorCodes';
import { win } from '../main';
import * as fs from 'fs';
import * as util from 'util';
import * as stream from 'stream';
import axios from 'axios';

import { Job, scheduleJob } from 'node-schedule';
import { autoUpdater } from 'electron-updater';

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

  ipcMain.handle('checkUpdate', (_e: any) => {
    autoUpdater.on('update-available', () => {
      win?.webContents.send('update-available');
    });
    autoUpdater.on('update-downloaded', () => {
      win?.webContents.send('update-downloaded');
    });
    autoUpdater.checkForUpdatesAndNotify();
  });

  ipcMain.handle('getVersion', (_e: any) => {
    return app.getVersion();
  });

  ipcMain.handle('restartApp', (_e: any) => {
    autoUpdater.quitAndInstall();
  });

  ipcMain.handle(
    'loginNaver',
    async (_e: any, naverIds: Array<INaverId>, isDebugMode: boolean): Promise<any> => {
      const createPage = async (naverId: string, password: string) => {
        try {
          const browser = await puppeteer.launch({
            ...options,
            executablePath: getChromiumExecutePath(),
            headless: !isDebugMode
          });
          console.log(browser.isConnected(), '브라우저 런칭완료');
          const browserPages = await browser.pages();
          const page = browserPages[0];
          page.on('error', msg => {
            console.log(msg);
            throw msg;
          });
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

        if (loginFailIds.length) return loginFailIds;
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
  const sendLogToRenderer = (log: any) => {
    console.log('센드로그 콜', log)
    win?.webContents.send('logs', { ...log, createdAt: Date.now() + Math.floor(Math.random() * 100) });
  };

  const jobs: Array<Job> = [];
  ipcMain.handle('stop', async (_: any) => {
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      job.cancel();
    }
    sendLogToRenderer({ type: '로그', text: '모든 작업을 종료합니다.' });
  });
  ipcMain.handle(
    'run',
    async (_: any, workings: Array<IWorking>, templates: Array<ITemplate>, setting: ISetting) => {
      // createdAt: string;
      // naverId: string;
      // type: string;
      // text: string;
      // workingId: string;

      //TODO: 스팸방지기능
      // const checkSpamAndDelete = async (working: IWorking) => {
      //   // 게시판으로 이동
      //   // 아이디로 검색
      //   // 날짜에
      // }

      const write = async (working: IWorking) => {
        console.log('작업목록 working', working);
        const getFirstImgOnContent = async (templateText: string) => {
          let firstImgUrl = templateText;
          firstImgUrl = firstImgUrl.slice(firstImgUrl.indexOf('img-attachment'));
          firstImgUrl = firstImgUrl.slice(firstImgUrl.indexOf('src="') + 5);
          firstImgUrl = firstImgUrl.slice(0, firstImgUrl.indexOf('"'));
          console.log(firstImgUrl, '퍼스트 이미지 url');

          const fileTypeCharArr = [];

          for (let i = firstImgUrl.length - 1; i > 0; i--) {
            const char = firstImgUrl[i];
            if (char === '.') break;
            fileTypeCharArr.unshift([char]);
          }

          const fileType = fileTypeCharArr.join('');
          const res = await axios.get(firstImgUrl, { responseType: 'stream' });
          const filepath = app.getAppPath() + '/temp.' + (fileType.length < 3 ? 'jpg' : fileType);
          const writeStream = fs.createWriteStream(filepath);
          try {
            const pipeline = util.promisify(stream.pipeline);
            await pipeline(res.data, writeStream);
            return filepath;
          } catch (e) {
            console.log('에러', e);
            throw e;
          }
        };
        const [template] = templates.filter(el => el.title === working.templateTitle);
        for (let i = 0; i < working.boardNames.length; i++) {
          const { url, isTradeBoard, name } = working.boardNames[i];
          const { page, browser }: { page: Page; browser: Browser } = browsers[working.naverId];

          console.log(i, '글 쓰러 이동합니다.', page.url(), url);
          page.on('dialog', async dialog => {
            await dialog.accept();
            await dialog.dismiss();
            page.removeListener('dialog', () => {});
          });
          await page.goto(url);
          // 글쓰기 버튼 클릭
          await page.waitForSelector('iframe');
          const boardIframeHandler = await page.$('iframe#cafe_main');
          const boardIframe = await boardIframeHandler?.contentFrame();
          if (!boardIframe) throw Error('에러발생');
          const writeButtonHandler = await boardIframe.waitForSelector('a#writeFormBtn', {
            visible: true
          });
          await writeButtonHandler?.click();

          await Promise.all([page.waitForSelector('iframe'), waitForNetworkIdle(page, 500, 0)]);

          // 글쓰기 권한 없는 게시판 아릶
          const isWritePermissionScreen = await boardIframe.$('p.tit_level');
          if (isWritePermissionScreen !== null) {
            sendLogToRenderer({
              type: '에러',
              text: '권한이 없는 게시판이 포함되어있습니다.',
              cafeName: working.cafeName + `(${name})`,
              workingId: working.workingId,
              naverId: working.naverId
            });
            continue;
          }
          const iframeHandler = await page.$('div#main-area iframe');
          const frame = await iframeHandler?.contentFrame();
          if (!frame) throw Error('에러발생');
          const titleInputHandler = await frame.waitForSelector('input#subject');
          await frame.evaluate(
            (el, title) => (el.value = title),
            titleInputHandler,
            template.title
          );

          if (isTradeBoard) {
            // 거래글
            // 본인인증이 완료되어있는지 확인
            // TODO: 본인인증 화면 나오면 제끼는 함수 필요함, 그리고 글 갯수 먼저 확인, 4개 초과면 삭제후 돌입
            const saleBtnHandler = await frame.waitForSelector('button#sale_direct');
            await saleBtnHandler?.click();

            const nPayBtnHandler = await frame.waitForSelector('.toggle_switch');
            await nPayBtnHandler?.click();

            await frame.focus('#sale_cost');
            const price =
              template.price && template.price > 2000 ? template.price.toString() : '2000';
            await page.keyboard.type(price);

            if (!template.exposePhoneNumber) {
              const exposeNumInputHandler = await frame.$('#sale_open_phone');
              exposeNumInputHandler?.click();
              if (template.useTempPhoneNumber) {
                const useTempNumInputHandler = await frame.$('#sale_otn_use');
                useTempNumInputHandler?.click();
              }
            }
            const firstImgPath = await getFirstImgOnContent(template.text);
            await page.waitFor(5000);
            await uploadPhotoOnCafe([firstImgPath], page, browser);
          } else {
            // 일반글
          }
          const writeIframeHandler = await boardIframe.$('td.read iframe');
          const writeIframe = await writeIframeHandler?.contentFrame();
          if (!writeIframe) throw Error('에러발생');
          const bodyHandler = await writeIframe.$('body');

          const removeFirstImgTag = (text: string) => {
            const startIdxImgTag = text.indexOf('<img');
            const endIdxImgTag = text.slice(startIdxImgTag).indexOf('>');
            return text.slice(0, startIdxImgTag) + text.slice(endIdxImgTag + 1, text.length - 1);
          };
          const text = isTradeBoard ? removeFirstImgTag(template.text) : template.text;

          await writeIframe.evaluate(
            (bodyHandler, htmlStr: string) => {
              bodyHandler.innerHTML = bodyHandler.innerHTML + htmlStr;
            },
            bodyHandler,
            text
          );

          const saveBtnHandler = await boardIframe.$('a#cafewritebtn');
          if (!saveBtnHandler) throw '글 작성 버튼 찾기 실패';
          await saveBtnHandler?.click();
          const linkUrlHandler = await boardIframe.waitForSelector('a#linkUrl', { visible: true });
          const linkUrl = await boardIframe.evaluate(el => el.innerText, linkUrlHandler);
          sendLogToRenderer({
            workingId: working.workingId,
            naverId: working.naverId,
            cafeName: working.cafeName,
            url: linkUrl,
            text: '글 작성을 완료했습니다.',
            type: '로그'
          });
        }
      };

      // 현재 시간이 시간내인지 확인
      const { runTimes } = setting;

      const runTimeArr = [];
      const runTimeKeys = Object.keys(runTimes);
      for (let i = 0; i < runTimeKeys.length; i++) {
        const key = runTimeKeys[i];
        const value = runTimes[key];
        if (value) {
          runTimeArr.push(key);
        }
      }

      console.log('시작');
      sendLogToRenderer({
        type: '로그',
        text: '작업을 시작합니다. 대기 시간동안 대기합니다.'
      });
      jobs.push(
        scheduleJob(
          '*/' + setting.minPerWrite + ' ' + runTimeArr.join(',') + ' * * *',
          async () => {
            for (let i = 0; i < workings.length; i++) {
              const working = workings[i];
              if (setting.spamMode) {
                // TODO: 글 4개 이상인지 체크 후 이상이라면 삭제
                // await checkSpamAndDelete(working);
              }
              await write(working);
            }
          }
        )
      );
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

const uploadPhotoOnCafe = async (
  filePaths: Array<string>,
  customPage?: Page,
  customBrowser?: Browser
) => {
  // 글쓰기 페이지에서 사진 추가 팝업 띄움
  try {
    let page: Page;
    let browser: Browser;
    if (customPage && customBrowser) {
      page = customPage;
      browser = customBrowser;
    } else {
      page = browsers.imageUpload.page;
      browser = browsers.imageUpload.browser;
    }
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

    if (customPage && customBrowser) {
      return;
    }

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
    // waitForNetworkIdle(page, 500, 0),
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
