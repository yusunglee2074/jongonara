import * as React from 'react';
import { useEffect, useState } from 'react';
import { remote, ipcRenderer } from 'electron';
import { Page, Browser } from 'puppeteer';
import { PUPPETEER_BROWSER_OPTIONS_ARGS } from '../constants';

const puppeteer = remote.require('puppeteer');

interface IPageProcesses {
  page: Page;
  status: null | string;
  naverId: null | string;
  cronId: null | string;
}

interface IMainPuppeteer {
  browser: Browser;
  pageProcesses: Array<IPageProcesses>;
  cron: string;
}

interface IContextDefaultValue {
  authenticated: boolean;
  setAuthenticated: Function;
  contextUser: object;
  setContextUser: Function;
  mainPuppeteer: IMainPuppeteer;
  setMainPuppeteer: Function;
  naverIds: Array<INaverId>;
  setNaverIds: Function;
  naverCafes: Array<INaverCafe>;
  setNaverCafes: Function;
  templates: Array<ITemplate>;
  setTemplates: Function;
  workings: Array<IWorking>;
  setWorkings: Function;
  logs: Array<ILog>;
  setLogs: Function;
}

interface INaverId {
  id: number;
  naverId: string;
  connection: boolean;
}

interface INaverCafe {
  id: number;
  naverId: INaverId['id'];
  cafeId: string;
  cafeName: string;
  cafeBoardId: string;
  cafeBoardName: string;
}

interface ITemplate {
  id: number;
  type: string;
  title: string;
  text: string;
}

interface IWorking {
  id: number;
  type: string;
  title: string;
  text: string;
  naverId: INaverId['id'];
  naverCafeId: INaverCafe['id'];
  templateId: ITemplate['id'];
}

interface ILog {
  createdAt: string;
  title: string;
  text: string;
  workingId: IWorking['id'];
}

const RootContext = React.createContext({} as IContextDefaultValue);

const RootContextProvider = (props: any) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [contextUser, setContextUser] = useState({});
  const [mainPuppeteer, setMainPuppeteer] = useState({} as IMainPuppeteer);
  const [naverIds, setNaverIds] = useState([] as Array<INaverId>);
  const [naverCafes, setNaverCafes] = useState([] as Array<INaverCafe>);
  const [templates, setTemplates] = useState([] as Array<ITemplate>);
  const [workings, setWorkings] = useState([] as Array<IWorking>);
  const [logs, setLogs] = useState([] as Array<ILog>);

  useEffect(() => {
    // 애플리케이션 시작시, 기타 초기화 루틴도 적용 예정, 시작시 단 한번만 실행
    const initBrowser = async () => {
      const getChromiumExecPath = () => {
        const text = puppeteer
          .executablePath()
          .replace('app.asar', 'app.asar.unpacked/node_modules/puppeteer');
        return text.replace('/dist', '/node_modules/puppeteer');
      };
      const options = {
        args: PUPPETEER_BROWSER_OPTIONS_ARGS,
        headless: true,
        ignoreHTTPSErrors: true,
        userDataDir: './tmp'
      };
      const browser = await puppeteer.launch({
        ...options,
        executablePath: getChromiumExecPath(),
        headless: false
      });

      const initialPages: Array<Page> = await browser.pages();
      const pageProcesses: Array<IPageProcesses> = [
        {
          page: initialPages[0],
          naverId: null,
          status: null,
          cronId: null
        }
      ];

      setMainPuppeteer({
        ...mainPuppeteer,
        browser,
        pageProcesses
      });

      // 외부의 main process 에서 오는 종료를 감지해서 크로미니엄 브라우저를 종료시킨다.
      ipcRenderer.on('quit', async (event: string) => {
        console.log(event);
        if (event === 'quit') {
          const pages = await mainPuppeteer.browser.pages();
          const promiseArr = [];
          for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            promiseArr.push(page.close());
          }
          await Promise.all(promiseArr);
          await mainPuppeteer.browser.close();
        }
      });
    };

    (async () => {
      await initBrowser();
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    authenticated,
    setAuthenticated,
    contextUser,
    setContextUser,
    mainPuppeteer,
    setMainPuppeteer,
    naverIds,
    setNaverIds,
    naverCafes,
    setNaverCafes,
    templates,
    setTemplates,
    workings,
    setWorkings,
    logs,
    setLogs
  };

  return <RootContext.Provider value={value}>{props.children}</RootContext.Provider>;
};

export { RootContext, RootContextProvider };
