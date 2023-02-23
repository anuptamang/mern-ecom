import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | My App</title>
      </Helmet>
      <mark>Public Privacy Policy</mark>
    </>
  );
};

export { PrivacyPolicy };
