import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  getLogsOnDB,
  getNaverIdsOnDB,
  getSettingsOnDB,
  getTemplatesOnDB,
  getWorkingsOnDB,
  ILog,
  INaverId,
  IRunTimes,
  ISetting,
  ITemplate,
  IWorking
} from '../store/Store';

interface IContextDefaultValue {
  authenticated: boolean;
  setAuthenticated: Function;
  isNaverLoggedIn: boolean;
  setIsNaverLoggedIn: Function;
  contextUser: { msg: string; err: object };
  setContextUser: Function;
  naverIds: Array<INaverId>;
  setNaverIds: Function;
  templates: Array<ITemplate>;
  setTemplates: Function;
  workings: Array<IWorking>;
  setWorkings: Function;
  logs: Array<ILog>;
  setLogs: Function;
  setting: ISetting;
  setSetting: Function;
  runningStatus: IRunning;
  setRunningStatus: Function;
}

export enum RunningStatus {
  Stop = '정지',
  Running = '작동중'
}

export interface IRunning {
  status: RunningStatus;
}

const RootContext = React.createContext({} as IContextDefaultValue);

const RootContextProvider = (props: any) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [isNaverLoggedIn, setIsNaverLoggedIn] = useState(false);
  const [contextUser, setContextUser] = useState({ err: {}, msg: '없음' });
  const [naverIds, setNaverIds] = useState([] as Array<INaverId>);
  const [templates, setTemplates] = useState([] as Array<ITemplate>);
  const [workings, setWorkings] = useState([] as Array<IWorking>);
  const [logs, setLogs] = useState([] as Array<ILog>);
  const [setting, setSetting] = useState({ runTimes: {} as IRunTimes } as ISetting);
  const [runningStatus, setRunningStatus] = useState({ status: RunningStatus.Stop } as IRunning);

  useEffect(() => {
    // 애플리케이션 시작시, 기타 초기화 루틴도 적용 예정, 시작시 단 한번만 실행
    const initDB = async () => {
      const naverIdsOnDB = await getNaverIdsOnDB();
      setNaverIds(naverIdsOnDB.map(el => ({ ...el, connection: '로그인을 시도해주세요.' })));
      setTemplates(await getTemplatesOnDB());
      setWorkings(await getWorkingsOnDB());
      setLogs(await getLogsOnDB());
      setSetting(await getSettingsOnDB());
    };

    (async () => {
      await initDB();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let isLoggedIn = false;
    for (let i = 0; i < naverIds.length; i++) {
      const { connection } = naverIds[i];
      if (connection === '로그인 성공') {
        isLoggedIn = true;
      }
    }
    setIsNaverLoggedIn(isLoggedIn);
  }, [naverIds]);

  const value = {
    authenticated,
    setAuthenticated,
    isNaverLoggedIn,
    setIsNaverLoggedIn,
    contextUser,
    setContextUser,
    naverIds,
    setNaverIds,
    templates,
    setTemplates,
    workings,
    setWorkings,
    logs,
    setLogs,
    setting,
    setSetting,
    runningStatus,
    setRunningStatus
  };

  return <RootContext.Provider value={value}>{props.children}</RootContext.Provider>;
};

export { RootContext, RootContextProvider };
