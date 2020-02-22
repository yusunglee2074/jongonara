import * as React from 'react';
import { Button, Divider, Form, Icon, Input } from 'antd';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { FormEvent } from 'react';

const LoginScreen: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    history.push('/home');
  };
  return (
    <>
      <Form layout={'inline'} onSubmit={onSubmit}>
        <p>저희 서비스를 이용해 주셔서 감사합니다.</p>
        <p>공지사항</p>
        <Input
          prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="아이디"
        />
        <Input
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
          type="password"
          placeholder="패스워드"
        />
        <Button type="primary" htmlType="submit" className="login-form-button">
          로그인
        </Button>
        <Divider />
        <Link to={'/registration'}>회원가입</Link>
      </Form>
    </>
  );
};

export default withRouter(LoginScreen);
