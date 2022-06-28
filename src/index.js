import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { GeistProvider, CssBaseline } from '@geist-ui/core'
import VConsole from 'vconsole';
 new VConsole();
ReactDOM.render(
  <React.StrictMode>
    <GeistProvider>
      <CssBaseline/>
      <App />
    </GeistProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
