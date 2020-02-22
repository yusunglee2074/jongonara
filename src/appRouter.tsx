import * as React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import login from './screens/welcome/login';
import registration from './screens/welcome/registration';
import appLayout from './screens/appLayout';
import { useContext } from 'react';
import { RootContext } from './appContext';

const AppRouter = () => {
  const { authenticated } = useContext(RootContext);

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" component={LoginScreen} />
        <Route path="/registration" component={RegistrationPage} />
        <Route
          path="/"
          render={() => (!authenticated ? <AppLayout /> : <Redirect to={'/login'} />)}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default AppRouter;
