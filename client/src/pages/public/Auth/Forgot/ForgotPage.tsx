import { Col, Row } from 'antd';
import { Container } from 'components';
import { pageRoutes } from 'data/static/pageRoutes';
import { ForgotForm } from 'features/ForgotForm';
import { useAuth } from 'hooks';
import { usePageTitle } from 'hooks/usePageTitle';
import { Navigate, useLocation } from 'react-router-dom';

const ForgotPage = () => {
  let auth = useAuth();
  let location = useLocation();
  const title = usePageTitle();

  if (auth?.token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return (
      <Navigate
        to={`/${pageRoutes.userDashboard}`}
        state={{ from: location }}
        replace
      />
    );
  }
  return (
    <>
      {title}
      <Container style={{ paddingTop: '50px', paddingBottom: '50px' }}>
        <Row justify={'center'}>
          <Col md={10}>
            <ForgotForm />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export { ForgotPage };
