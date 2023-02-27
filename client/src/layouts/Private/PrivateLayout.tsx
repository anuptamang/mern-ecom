import { Col, Layout, Row } from 'antd';
import { Container, ContentLayout, SiderLayout } from 'components';
import { Outlet } from 'react-router';
import { IChildren } from 'types';

const PrivateLayout = ({ children }: IChildren) => {
  return (
    <Layout style={{ display: 'block', padding: '50px 0' }}>
      <Container>
        <Row>
          <Col md={8}>
            <SiderLayout>Sidebar</SiderLayout>
          </Col>
          <Col md={16}>
            <ContentLayout>{children ? children : <Outlet />}</ContentLayout>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export { PrivateLayout };
