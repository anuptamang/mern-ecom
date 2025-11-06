'use client';

import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import store from '@/redux/store';
import { ThemeProvider } from '@/components';
import { debounce, saveState } from '@/utils';
import 'antd/dist/reset.css';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';

// Initialize axios interceptors and token validation
import '@/configs/axios/axiosInterceptor';

// Save Redux state to localStorage (only on client side)
if (typeof window !== 'undefined') {
  store.subscribe(
    debounce(500, () => {
      saveState(store.getState(), 'user');
    })
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Provider store={store}>
          <Suspense fallback={null}>
            <ThemeProvider>
              <HelmetProvider>
                {children}
                <ToastContainer />
              </HelmetProvider>
            </ThemeProvider>
          </Suspense>
        </Provider>
      </body>
    </html>
  );
}
