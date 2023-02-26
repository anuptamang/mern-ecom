import { Helmet } from 'react-helmet-async';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'hooks';
import { Container } from 'components';
import { pageRoutes } from 'data/static/pageRoutes';
import { Col, Row } from 'antd';
import { ForgotForm } from 'features/ForgotForm';

const ForgotPage = () => {
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
        <title>Forgot Password | My App</title>
      </Helmet>
      <Container>
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
