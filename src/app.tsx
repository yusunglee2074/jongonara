import 'react-hot-loader';
import { AppContainer } from 'react-hot-loader';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import { RootContextProvider } from './context/AppContext';
import AppRouter from './router/AppRouter';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Render components
const render = (Component: () => JSX.Element) => {
  ReactDOM.render(
    <AppContainer>
      <RootContextProvider>
        <Component />
      </RootContextProvider>
    </AppContainer>,
    mainElement
  );
};

render(AppRouter);

// Hot Module Replacement API
if (typeof module.hot !== 'undefined') {
  module.hot.accept('./router/AppRouter', () => {
    import('./router/AppRouter').then(World => {
      render(World.default);
    });
  });
}
