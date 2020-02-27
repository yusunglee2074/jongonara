import * as React from 'react';
import { useEffect, useState } from 'react';
import { Page, Browser } from 'puppeteer';
import { launchBrowser } from '../ipc/renderer-IPC'

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
  contextUser: { msg: string; err: object };
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

export interface INaverId {
  id: number;
  naverId: string;
  connection: boolean;
}

export interface INaverCafe {
  id: number;
  naverId: INaverId['id'];
  cafeId: string;
  cafeName: string;
  cafeBoardId: string;
  cafeBoardName: string;
}

export interface ITemplate {
  id: number;
  type: string;
  title: string;
  text: string;
}

export interface IWorking {
  id: number;
  type: string;
  title: string;
  text: string;
  naverId: INaverId['id'];
  naverCafeId: INaverCafe['id'];
  templateId: ITemplate['id'];
}

export interface ILog {
  createdAt: string;
  title: string;
  text: string;
  workingId: IWorking['id'];
}

const RootContext = React.createContext({} as IContextDefaultValue);

const RootContextProvider = (props: any) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [contextUser, setContextUser] = useState({err: {}, msg: '없음'});
  const [mainPuppeteer, setMainPuppeteer] = useState({} as IMainPuppeteer);
  const [naverIds, setNaverIds] = useState([] as Array<INaverId>);
  const [naverCafes, setNaverCafes] = useState([] as Array<INaverCafe>);
  const [templates, setTemplates] = useState([] as Array<ITemplate>);
  const [workings, setWorkings] = useState([] as Array<IWorking>);
  const [logs, setLogs] = useState([] as Array<ILog>);

  useEffect(() => {
    // 애플리케이션 시작시, 기타 초기화 루틴도 적용 예정, 시작시 단 한번만 실행
    const initBrowser = async () => {
      const result = launchBrowser();
      console.log(result);
    };

    const initDB = async () => {
      // const sqlite = require('sqlite3').verbose();
      // const db = new sqlite.Database(':memory:');
      //
      // db.serialize(function() {
      //   db.run("CREATE TABLE lorem (info TEXT)");
      //
      //   var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
      //   for (var i = 0; i < 10; i++) {
      //     stmt.run("Ipsum " + i);
      //   }
      //   stmt.finalize();
      //
      //   db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      //     console.log(row.id + ": " + row.info);
      //   });
      // });
      //
      // db.close();

    }

    (async () => {
      await initBrowser();
      await initDB();
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
