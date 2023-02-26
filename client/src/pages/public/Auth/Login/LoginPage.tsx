import { Helmet } from 'react-helmet-async';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'hooks';
import { pageRoutes } from 'data/static/pageRoutes';
import { LoginForm } from 'features';
import { Container } from 'components';
import { Col, Row } from 'antd';

const LoginPage = () => {
  let auth = useAuth();
  let location = useLocation();

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
      <Helmet>
        <title>Login | My App</title>
      </Helmet>
      <Container>
        <Row justify={'center'}>
          <Col md={10}>
            <LoginForm />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export { LoginPage };
