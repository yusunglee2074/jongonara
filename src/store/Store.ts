const Store = require('electron-store');

const store = new Store();

export interface INaverId {
  id: string;
  password: string;
  connection?: string;
}

export interface ITemplate {
  type: string;
  price?: number;
  exposePhoneNumber?: boolean;
  useTempPhoneNumber?: boolean;
  repBase64Image: string;
  tags?: string;
  title: string;
  text: string;
}

export interface IUserInfo {
  loginId?: string;
  expirationDate: string;
  pcId?: string;
}

export interface IWorking {
  workingId: string;
  naverId: string;
  cafeName: string;
  cafeUrl: string;
  boardNames: Array<any>;
  templateTitle: string;
  isTrade: boolean;
  shouldRun: boolean;
}

export interface ILog {
  createdAt: string;
  type?: string;
  text?: string;
  workingId?: string;
  naverId?: string;
  cafeName?: string;
  url?: string;
}

export interface ISetting {
  runTimes: IRunTimes;
  minPerWrite: number;
  debugMode: boolean;
  spamMode: boolean;
}

export interface IRunTimes {
  [index: string]: boolean;
}

export const getNaverIdsOnDB = async (): Promise<Array<INaverId>> => {
  try {
    const ids = await store.get('naverIds');
    if (!ids) return [];
    return ids;
  } catch (e) {
    throw Error(e.message);
  }
};

export const setNaverIdsOnDB = async (naverIds: Array<INaverId>): Promise<Array<INaverId>> => {
  try {
    await store.set('naverIds', naverIds);
    return await store.get('naverIds');
  } catch (e) {
    throw Error(e.message);
  }
};
export const getTemplatesOnDB = async (): Promise<Array<ITemplate>> => {
  try {
    const templates = await store.get('templates');
    if (!templates) return [];
    return templates;
  } catch (e) {
    throw Error(e.message);
  }
};

export const setTemplatesOnDB = async (templates: Array<ITemplate>): Promise<Array<ITemplate>> => {
  try {
    await store.set('templates', templates);
    return await store.get('templates');
  } catch (e) {
    throw Error(e.message);
  }
};
export const getWorkingsOnDB = async (): Promise<Array<IWorking>> => {
  try {
    const workings = await store.get('workings');
    if (!workings) return [];
    return workings;
  } catch (e) {
    throw Error(e.message);
  }
};

export const setWorkingsOnDB = async (workings: Array<IWorking>): Promise<Array<IWorking>> => {
  try {
    await store.set('workings', workings);
    return await store.get('naverIds');
  } catch (e) {
    throw Error(e.message);
  }
};
export const getLogsOnDB = async (): Promise<Array<ILog>> => {
  try {
    const logs = await store.get('logs');
    if (!logs) return [];
    return logs;
  } catch (e) {
    throw Error(e.message);
  }
};

export const setLogsOnDB = async (logs: Array<ILog>): Promise<Array<ILog>> => {
  try {
    await store.set('logs', logs);
    return await store.get('logs');
  } catch (e) {
    throw Error(e.message);
  }
};

export const getSettingsOnDB = async (): Promise<ISetting> => {
  try {
    const setting = await store.get('setting');
    if (!setting) {
      const tempObj = {} as IRunTimes;
      for (let i = 0; i < 24; i++) {
        const key = i < 10 ? i.toString() + '0' : i.toString();
        tempObj[key] = true;
      }
      return { runTimes: tempObj } as ISetting;
    }
    return setting;
  } catch (e) {
    throw Error(e.message);
  }
};

export const setSettingsOnDB = async (setting: ISetting): Promise<ISetting> => {
  try {
    await store.set('setting', setting);
    return await store.get('setting');
  } catch (e) {
    throw Error(e.message);
  }
};

export const getUserInfoOnDB = async (): Promise<IUserInfo> => {
  try {
    const userInfo = await store.get('userInfo');
    if (!userInfo) return { expirationDate: new Date().toISOString() };
    return userInfo;
  } catch (e) {
    throw Error(e.message);
  }
};

export const setUserInfoOnDB = async (userInfo: IUserInfo): Promise<IUserInfo> => {
  try {
    await store.set('userInfo', userInfo);
    return await store.get('userInfo');
  } catch (e) {
    throw Error(e.message);
  }
};
