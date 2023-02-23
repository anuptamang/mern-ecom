import { Layout } from 'antd';
import { Header, Content, Footer } from 'components';
import { ReactElement } from 'react';
import { ToastContainer } from 'react-toastify';

type Iprops = {
  children?: ReactElement;
};

const General = ({ children }: Iprops) => {
  return (
    <>
      <Layout
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Header />
        <Layout
          style={{
            flexGrow: 1,
            width: '100%',
          }}
        >
          <Content>{children}</Content>
        </Layout>
        <Footer />
        <ToastContainer />
      </Layout>
    </>
  );
};

export { General };
