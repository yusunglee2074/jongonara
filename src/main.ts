import { app, BrowserWindow } from 'electron';
// import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as url from 'url';
// import { ElementHandle } from 'puppeteer'

let win: BrowserWindow | null;

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const createWindow = async () => {
  if (process.env.NODE_ENV !== 'production') {
    await installExtensions();
  }

  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    win.loadURL(`http://localhost:2003`);
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  /* 로그인 후 카페 목록 가져오기까지
  function getChromiumExecPath() {
    const text = puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked/node_modules/puppeteer');
    return text.replace('/dist', '/node_modules/puppeteer');
  }

  try {
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
    ];

    const options = {
      args,
      headless: true,
      ignoreHTTPSErrors: true,
      userDataDir: './tmp'
    };
    const browser = await puppeteer.launch({
      ...options,
      executablePath: getChromiumExecPath(),
      headless: false
    })
    const pages = await browser.pages()
    const page = pages[0];
    await page.goto('https://nid.naver.com/nidlogin.login');
    await page.waitForSelector('input[id="id"]');
    await page.waitFor(1000);
    await page.$eval('input[id="id"]', e => {
      e.setAttribute('value', 'lys20741')
    });
    await page.waitFor(1000);
    await page.$eval('input[id="pw"]', (e) => {
      e.setAttribute('value', 'dldbtjd12')
    });
    await page.waitFor(1000);
    await page.click('input[id="log.login"]');
    const cafeBtn = await page.waitForSelector('a[href="https://section.cafe.naver.com/"]');
    await cafeBtn.click();
    for await (const idx of [1,2,3,4,5]) {
      console.log(idx);
      await page.waitFor(1000);
      const elementElementHandle : ElementHandle = await page.waitForSelector('button.btn_mycafe_more', {
        timeout: 1000,
        visible: true,
      });
      await elementElementHandle.click();
    }


  } catch (e) {
    console.log('여기라고?')
    console.log(e);
  }

   */

  if (process.env.NODE_ENV !== 'production') {
    // Open DevTools
    win.webContents.openDevTools();
  }

  win.on('closed', () => {
    win = null;
  });
};

app.on('ready', async () => {
  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (win === null) {
    await createWindow();
  }
});
