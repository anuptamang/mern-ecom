import { Button, Layout } from 'antd';
import { Container, ContentLayout, ModalBox, SiderLayout } from 'components/UI';
import { pageRoutes } from 'data/static/pageRoutes';
import { UserSidePanel } from 'features';
import { useAuth } from 'hooks';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';
import { IChildren } from 'types';

const PrivateLayout = ({ children }: IChildren) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  let location = useLocation();
  let auth = useAuth();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    navigate(`/${pageRoutes.login}`, { state: { from: location } });
    localStorage.removeItem('user');
  };

  useEffect(() => {
    if (auth?.tokenStatus === 'expired') {
      showModal();
    }
  }, [auth?.tokenStatus]);

  return (
    <div style={{ display: 'block', padding: '50px 0' }}>
      <Container>
        <Layout>
          <SiderLayout style={{ borderRadius: 10, padding: 10 }}>
            <UserSidePanel />
          </SiderLayout>
          <ContentLayout
            style={{
              paddingLeft: 30,
              margin: 0,
            }}
          >
            {children ? children : <Outlet />}
          </ContentLayout>
        </Layout>
      </Container>
      <ModalBox
        closable={false}
        footer={[
          <Button key="submit" type="primary" onClick={handleOk}>
            Ok
          </Button>,
        ]}
        title="Your login session has expired. Please log in again to continue."
        open={isModalOpen}
        onOk={handleOk}
      />
    </div>
  );
};

export { PrivateLayout };
