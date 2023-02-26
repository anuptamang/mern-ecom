import { Helmet } from 'react-helmet-async';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'hooks';

const RegisterPage = () => {
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
        <title>Register | My App</title>
      </Helmet>
      Auth Register
    </>
  );
};

export { RegisterPage };
