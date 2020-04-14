import axios from 'axios';

const env = process.env.NODE_ENV;

if (env !== 'development') {
  axios.defaults.baseURL = '프로덕션 url';
} else {
  axios.defaults.baseURL = 'http://yusunglee.asuscomm.com:3003/v1';
}

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

export const register = async (loginId: string, password: string, pcId: string) => {
  return axios.post('/users', {
    loginId,
    password,
    pcId
  });
};

export const login = async (loginId: string, password: string, pcId: string) => {
  return axios.post('/users/login', {
    loginId,
    password,
    pcId
  });
};
