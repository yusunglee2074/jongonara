import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  getLogsOnDB,
  getNaverIdsOnDB,
  getSettingsOnDB,
  getTemplatesOnDB,
  getUserInfoOnDB,
  getWorkingsOnDB,
  ILog,
  INaverId,
  IRunTimes,
  ISetting,
  ITemplate,
  IUserInfo,
  IWorking
} from '../store/Store';
import { isAfter } from 'date-fns';

interface IContextDefaultValue {
  userInfo: IUserInfo;
  setUserInfo: Function;
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
  const [userInfo, setUserInfo] = useState({
    expirationDate: new Date().toISOString()
  } as IUserInfo);
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
      const dbLogs = await getLogsOnDB();
      setLogs(
        dbLogs.sort((a, b) => (isAfter(new Date(a.createdAt), new Date(b.createdAt)) ? -1 : 1))
      );
      setSetting(await getSettingsOnDB());
      setUserInfo(await getUserInfoOnDB());
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
    userInfo,
    setUserInfo,
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
