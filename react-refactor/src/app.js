import React from 'react';
import ReactDOM from 'react-dom';

import AppComponent from './components/AppComponent/AppComponent';

function startApp() {
  let mountPoint: HTMLElement = document.createElement('div');
  document.body.appendChild(mountPoint);
  ReactDOM.render(<AppComponent />, mountPoint);
}

window.onload = startApp;
