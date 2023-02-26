import { Helmet } from 'react-helmet-async';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'hooks';

const ForgotPage = () => {
  let auth = useAuth();
  let location = useLocation();

  if (auth?.token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return (
      <Navigate to={'/user/dashboard'} state={{ from: location }} replace />
    );
  }
  return (
    <>
      <Helmet>
        <title>Forgot Password | My App</title>
      </Helmet>
      Auth forgot
    </>
  );
};

export { ForgotPage };
