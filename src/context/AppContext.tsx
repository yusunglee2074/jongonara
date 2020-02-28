import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  getLogsOnDB,
  getNaverIdsOnDB,
  getTemplatesOnDB,
  getWorkingsOnDB,
  ILog,
  INaverId,
  ITemplate,
  IWorking,
} from '../store/Store'

interface IContextDefaultValue {
  authenticated: boolean;
  setAuthenticated: Function;
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
}

const RootContext = React.createContext({} as IContextDefaultValue);

const RootContextProvider = (props: any) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [contextUser, setContextUser] = useState({err: {}, msg: '없음'});
  const [naverIds, setNaverIds] = useState([] as Array<INaverId>);
  const [templates, setTemplates] = useState([] as Array<ITemplate>);
  const [workings, setWorkings] = useState([] as Array<IWorking>);
  const [logs, setLogs] = useState([] as Array<ILog>);

  useEffect(() => {
    // 애플리케이션 시작시, 기타 초기화 루틴도 적용 예정, 시작시 단 한번만 실행
    const initDB = async () => {
      setNaverIds(await getNaverIdsOnDB());
      setTemplates(await getTemplatesOnDB());
      setWorkings(await getWorkingsOnDB());
      setLogs(await getLogsOnDB());
    }

    (async () => {
      await initDB();
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    authenticated,
    setAuthenticated,
    contextUser,
    setContextUser,
    naverIds,
    setNaverIds,
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
