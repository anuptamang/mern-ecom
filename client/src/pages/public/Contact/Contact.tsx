import { Container } from 'components';
import { Helmet } from 'react-helmet-async';

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contact | My App</title>
      </Helmet>
      <Container>
        <h1>Contact Page</h1>
      </Container>
    </>
  );
};

export { ContactPage };
