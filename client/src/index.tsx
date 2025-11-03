import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from 'redux/store';
import { debounce, saveState } from 'utils';
import reportWebVitals from './reportWebVitals';

import './index.css';
import { ThemeProvider } from 'components';

import 'antd/dist/reset.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// Initialize axios interceptors and token validation
import 'configs/axios/axiosInterceptor';

// Don't start token validation on app load - it will be started after successful login/register
// Starting it here can cause immediate logout if token is expired or invalid

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
          <ThemeProvider>
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </ThemeProvider>
        </Suspense>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
