import { Layout } from 'antd';
import { Header, Content, Footer } from 'components';
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
          overflow: 'hidden',
        }}
      >
        <Header />
        <div
          style={{
            flexGrow: 1,
            width: '100%',
          }}
        >
          <Content>{children}</Content>
        </div>
        <Footer />
        <ToastContainer />
      </Layout>
    </>
  );
};

export { GeneralLayout };
