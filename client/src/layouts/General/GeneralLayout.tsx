import { Layout } from 'antd';
import { Header, Footer } from 'components';
import { ContentLayout } from 'components/UI';
import { ReactElement } from 'react';
import { ToastContainer } from 'react-toastify';
import { Outlet } from 'react-router-dom';

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
        }}
      >
        <Header />
        <ContentLayout
          style={{
            flexGrow: 1,
            width: '100%',
            padding: '24px',
            overflow: 'auto',
          }}
        >
          {children || <Outlet />}
        </ContentLayout>
        <Footer />
        <ToastContainer />
      </Layout>
    </>
  );
};

export { GeneralLayout };
