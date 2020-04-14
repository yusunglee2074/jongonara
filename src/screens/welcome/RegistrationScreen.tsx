import * as React from 'react';
import { Button, Icon, Input, Divider, Form, message } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { machineId } from 'node-machine-id';
import styled from 'styled-components';
import { register } from '../../api';
import { useContext } from 'react';
import { RootContext } from '../../context/AppContext';
import { setUserInfoOnDB } from '../../store/Store';

const S = {
  TitleP: styled.p`
    font-size: 1.5rem;
    font-weight: bold;
    text-align: center;
    margin-top: 3rem;
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
const RegistrationScreen: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
  const { setAuthenticated, setUserInfo } = useContext(RootContext);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const pcId = await machineId(true);

    try {
      const res = await register(loginId, password, pcId);
      if (res.status === 200) {
        const userInfo = {
          loginId: res.data.data.loginId,
          pcId: res.data.data.pcId,
          expirationDate: res.data.data.expirationDate
        };
        message.info('반갑습니다.');
        setAuthenticated(true);
        setUserInfo(userInfo);
        await setUserInfoOnDB(userInfo);
        history.push('/home');
      }
    } catch (e) {
      console.log(Object.keys(e.response))
      if (e.response.status === 405) {
          message.error(
            `이미 ${e.response.data.data.loginId}로 가입 이력이 존재합니다. \n 가입 이력이 없으시다면 홈페이지를 통하여 문의 부탁드립니다.`
          );
      } else {
        message.error('서버에러');
      }
    }
  };

  return (
    <>
      <S.TitleP>회원가입</S.TitleP>
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
          <S.FormInput
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            type="password"
            placeholder="패스워드 확인"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
          />
          {password !== password2 && password.length > 0 ? '패스워드가 일치 하지 않습니다.' : ''}
          <S.FormButton
            onClick={onSubmit}
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            회원가입
          </S.FormButton>
          <Divider />
          <Link to={'/login'}>이미 아이디가 있으신가요?</Link>
        </Form>
      </S.FormDiv>
    </>
  );
};

export default withRouter(RegistrationScreen);
