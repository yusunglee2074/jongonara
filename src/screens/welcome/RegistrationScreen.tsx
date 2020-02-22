import * as React from 'react';
import { Button, Icon, Input, Divider, Form } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { FormEvent } from 'react';

const RegistrationScreen: React.FunctionComponent<RouteComponentProps> = ({ history }) => {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    history.push('/home');
  };
  return (
    <>
      <Form layout={'inline'} onSubmit={onSubmit}>
        <h2>회원가입</h2>
        <p>반갑습니다. 신규 가입자는 24시간 동안 무료 체험이 가능합니다.</p>
        <p>이용자 마다 하나의 아이디만 이용 가능합니다.</p>
        <Input
          prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
          placeholder="아이디"
        />
        <Input
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
          type="password"
          placeholder="패스워드"
        />
        <Input
          prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
          type="password"
          placeholder="패스워드 확인"
        />
        <Button onClick={onSubmit} type="primary" htmlType="submit" className="login-form-button">
          회원가입
        </Button>
        <Divider />
        <Link to={'/login'}>이미 아이디가 있으신가요?</Link>
      </Form>
    </>
  );
};

export default withRouter(RegistrationScreen);
