import { Helmet } from 'react-helmet-async';

const PrivacyPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | My App</title>
      </Helmet>
      <mark>Public Privacy Policy</mark>
    </>
  );
};

export { PrivacyPolicyPage };
