import { Container } from 'components';
import React from 'react';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Not Found | My App</title>
      </Helmet>
      <Container>
        <h1>Page Not Found</h1>
      </Container>
    </>
  );
};

export { NotFoundPage };
