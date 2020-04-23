import * as React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { useContext } from 'react';
import { RootContext } from '../context/AppContext';
import LoginScreen from '../screens/welcome/LoginScreen'
import AppLayout from '../layout/AppLayout'
import RegistrationScreen from '../screens/welcome/RegistrationScreen'

const AppRouter = () => {
  const { authenticated } = useContext(RootContext);

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" component={LoginScreen} />
        <Route path="/registration" component={RegistrationScreen} />
        <Route
          path="/"
          render={() => (authenticated ? <AppLayout /> : <Redirect to={'/login'} />)}
        />
      </Switch>
      {/* 채팅 채널톡 이용 <Chatting />*/}
    </BrowserRouter>
  );
};

export default AppRouter;
