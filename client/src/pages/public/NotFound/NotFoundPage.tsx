import React from 'react';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Not Found | My App</title>
      </Helmet>
      <h1>Page Not Found</h1>
    </>
  );
};

export { NotFoundPage };
