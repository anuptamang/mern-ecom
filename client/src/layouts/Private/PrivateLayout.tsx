import { Layout } from 'antd';
import { Container, ContentLayout, SiderLayout } from 'components';
import { UserSidePanel } from 'features';
import { Outlet } from 'react-router';
import { IChildren } from 'types';

const PrivateLayout = ({ children }: IChildren) => {
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
    </div>
  );
};

export { PrivateLayout };
