import * as React from 'react';
import { Button, Divider, Form, Icon, Input, message } from 'antd';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { machineId } from 'node-machine-id';
const { remote } = require('electron');
import { useContext, FormEvent } from 'react';
import { RootContext } from '../../context/AppContext';
import { useState } from 'react';
import { login } from '../../api';
import { setUserInfoOnDB } from '../../store/Store';

const S = {
  LogoImgDiv: styled.div`
    width: 5rem;
    margin: 2rem auto;
  `,
  LogoImg: styled.img`
    width: 5rem;
  `,
  TitleP: styled.p`
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
  `,
  FormDiv: styled.div`
    width: 30rem;
    margin: auto;
    padding-top: 1rem;
  `,
  FormInput: styled(Input)`
    margin-bottom: 1rem;
  `,
  FormButton: styled(Button)`
    width: 100%;
  `
};

const LoginScreen: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
  const { setAuthenticated, setUserInfo } = useContext(RootContext);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const pcId = await machineId(true);
      const res = await login(loginId, password, pcId);
      setAuthenticated(true);
      setUserInfo(res.data.data);
      message.info('반갑습니다.');
      await setUserInfoOnDB(res.data.data);
      setAuthenticated(true);
    } catch (e) {
      const { response } = e;
      if (response) {
        message.error(response.data.message);
      } else {
        console.log(e);
      }
    }
    history.push('/home');
  };

  const goHomePage = async (e: any) => {
    e.preventDefault();
    await remote.shell.openExternal(e.target.href);
  };

  return (
    <>
      <S.LogoImgDiv>
        <S.LogoImg src="/public/icon.png" alt="로고이미지" />
      </S.LogoImgDiv>
      <S.TitleP>NEVER 카페 글 자동 등록기</S.TitleP>
      <S.FormDiv>
        <Form layout={'inline'} onSubmit={onSubmit}>
          <S.FormInput
            prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="아이디"
            value={loginId}
            onChange={e => setLoginId(e.target.value)}
          />
          <S.FormInput
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder="패스워드"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <S.FormButton type="primary" htmlType="submit" className="login-form-button">
            로그인
          </S.FormButton>
          <Divider />
          <Link to={'/registration'}>회원가입</Link>
          <a
            style={{ marginLeft: '1rem' }}
            href="https://yusunglee.com"
            target="_blank"
            onClick={goHomePage}
          >
            홈페이지
          </a>
        </Form>
      </S.FormDiv>
    </>
  );
};

export default withRouter(LoginScreen);
