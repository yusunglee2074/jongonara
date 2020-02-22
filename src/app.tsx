import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import 'antd/dist/antd.css';
import appRouter from './appRouter';
import { RootContextProvider } from './appContext';

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
  module.hot.accept('./appRouter', () => {
    import('./appRouter').then(router => {
      render(router.default);
    });
  });
}
