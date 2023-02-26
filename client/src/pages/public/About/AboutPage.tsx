import { Container } from 'components';
import { Helmet } from 'react-helmet-async';

export const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About | My App</title>
      </Helmet>
      <Container>
        <h1>About Page</h1>
      </Container>
    </>
  );
};
