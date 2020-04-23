import 'react-hot-loader';
import { AppContainer } from 'react-hot-loader';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RootContextProvider } from './context/AppContext';
import AppRouter from './router/AppRouter';

import 'antd/dist/antd.css';
import './app.css';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Adding channel talk
const channelTalkScript = document.createElement('script');
channelTalkScript.type = 'text/javascript';
channelTalkScript.async = true;
channelTalkScript.innerText = `
  (function() {
    var w = window;
    if (w.ChannelIO) {
      return (window.console.error || window.console.log || function(){})('ChannelIO script included twice.');
    }
    var d = window.document;
    var ch = function() {
      ch.c(arguments);
    };
    ch.q = [];
    ch.c = function(args) {
      ch.q.push(args);
    };
    w.ChannelIO = ch;
    function l() {
      if (w.ChannelIOInitialized) {
        return;
      }
      w.ChannelIOInitialized = true;
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
      s.charset = 'UTF-8';
      var x = document.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
    }
    if (document.readyState === 'complete') {
      l();
    } else if (window.attachEvent) {
      window.attachEvent('onload', l);
    } else {
      window.addEventListener('DOMContentLoaded', l, false);
      window.addEventListener('load', l, false);
    }
  })();
  ChannelIO('boot', {
    "pluginKey": "d44d39e5-f85b-452b-a3fc-81a1dd29cfa6"
  });
`;
document.body.appendChild(channelTalkScript);

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
