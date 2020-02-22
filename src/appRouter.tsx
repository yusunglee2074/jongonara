import * as React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { useContext } from 'react';
import { RootContext } from './appContext';
import LoginScreen from './screens/welcome/login'
import AppLayout from './screens/appLayout'
import RegistrationScreen from './screens/welcome/registration'

const AppRouter = () => {
  const { authenticated } = useContext(RootContext);

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" component={LoginScreen} />
        <Route path="/registration" component={RegistrationScreen} />
        <Route
          path="/"
          render={() => (!authenticated ? <AppLayout /> : <Redirect to={'/login'} />)}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default AppRouter;
