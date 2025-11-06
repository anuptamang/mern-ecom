'use client';

import { Layout } from 'antd';
import { Header, Footer } from '@/components';
import { ContentLayout } from '@/components/UI';
import { ReactElement } from 'react';
import { ToastContainer } from 'react-toastify';

type Iprops = {
  children?: ReactElement;
};

const GeneralLayout = ({ children }: Iprops) => {
  return (
    <>
      <Layout
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        <Header />
        <div style={{ height: '64px' }} /> {/* Spacer for fixed header */}
        <ContentLayout
          style={{
            flexGrow: 1,
            width: '100%',
            maxWidth: '100%',
            padding: '24px',
            paddingTop: 0,
            overflow: 'auto',
            overflowX: 'hidden',
          }}
        >
          {children}
        </ContentLayout>
        <Footer />
        <ToastContainer />
      </Layout>
    </>
  );
};

export { GeneralLayout };
