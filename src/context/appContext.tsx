import * as React from 'react';
import { ReactNode, useEffect, useState } from 'react';
import { remote, ipcRenderer } from 'electron';
import { Page, Browser } from 'puppeteer';
import { PUPPETEER_BROWSER_OPTIONS_ARGS } from './constants';

const puppeteer = remote.require('puppeteer');

interface IProps {
  children: ReactNode;
}

interface Log {
  createdAt: string;
  type: string;
  naverId: string;
  text: string;
}

interface IPageProcesses {
  page: Page;
  status: null | string;
  naverId: null | string;
  cronId: null | string;
}

interface IMainPuppeteer {
  browser: Browser;
  pageProcesses: Array<IPageProcesses>;
  logs: Array<Log>;
  cron: string;
}

interface IContextDefaultValue {
  authenticated: boolean;
  setAuthenticated: Function;
  contextUser: object;
  setContextUser: Function;
  mainPuppeteer: IMainPuppeteer;
  setMainPuppeteer: Function;
}

interface INaverIds {
  naverId: string;
}

interface INaverCafe {
  naverId: string;
  cafeId: string;
  cafeName: string;
  cafeBoardId: string;
  cafeBoardName: string;
}

const RootContext = React.createContext({} as IContextDefaultValue);

const RootContextProvider = ({ children }: IProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [contextUser, setContextUser] = useState({});
  const [mainPuppeteer, setMainPuppeteer] = useState({} as IMainPuppeteer);

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
      if (!mainPuppeteer.browser) {
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
      }

      // 외부의 main process 에서 오는 종료를 감지해서 크로미니엄 브라우저를 종료시킨다.
      ipcRenderer.on('quit', async (event: string) => {
        console.log(event);
        if (event === 'quit') {
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
    setMainPuppeteer
  };

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
};

export { RootContext, RootContextProvider };
