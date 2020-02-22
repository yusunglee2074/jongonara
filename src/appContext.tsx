import * as React from 'react';
import { ReactNode, useEffect, useState } from 'react';

interface IProps {
  children: ReactNode;
}
interface IContextDefaultValue {
  authenticated: boolean;
  setAuthenticated: Function;
  contextUser: object;
  setContextUser: Function;
}

const RootContext = React.createContext({} as IContextDefaultValue);

const RootContextProvider = ({ children }: IProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [contextUser, setContextUser] = useState({});

  useEffect(() => {
    // 애플리케이션 시작시 인증 확인, 기타 초기화 루틴도 적용 예정, 시작시 단 한번만 실행
    const auth = async () => {};

    auth();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    authenticated,
    setAuthenticated,
    contextUser,
    setContextUser
  };

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
};

export { RootContext, RootContextProvider };
