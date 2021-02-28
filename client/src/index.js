// jsファイル以外は拡張子まで書く
// 相対パスでない場合はwebpackが自動でnode_modulesからファイルを探す
import 'materialize-css/dist/css/materialize.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import reduxThunk from 'redux-thunk'
import App from './components/App';
import reducers from './reducers';

// Development only axios helpers!（本番デプロイ時は削除する！）
import axios from 'axios';
window.axios = axios;

// Redux拡張機能 と Redux store の設定
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, {}, composeEnhancers(applyMiddleware(reduxThunk)));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector('#root')
);
