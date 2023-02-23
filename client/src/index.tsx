import { ConfigProvider } from 'antd';
import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from 'redux/store';
import { debounce, saveState } from 'utils';
import reportWebVitals from './reportWebVitals';

import { theme } from 'assets/styles/antd/theme';

import 'antd/dist/reset.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const App = lazy(() => import('components/App'));

const container = document.getElementById('root')!;
const root = createRoot(container);

store.subscribe(
  debounce(500, () => {
    saveState(store.getState(), 'user');
  })
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={null}>
          <ConfigProvider theme={theme}>
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </ConfigProvider>
        </Suspense>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
