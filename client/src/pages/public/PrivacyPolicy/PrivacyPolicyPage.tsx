import { Container } from 'components/UI';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | My App</title>
      </Helmet>
      <Container>
        <h1>Privacy policy Page</h1>
      </Container>
    </>
  );
};

export { PrivacyPolicyPage };
