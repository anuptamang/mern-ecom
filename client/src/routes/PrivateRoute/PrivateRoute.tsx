import { pageRoutes } from 'data/static/pageRoutes';
import { useAuth } from 'hooks';
import { PrivateLayout } from 'layouts';
import { JSXElementConstructor, ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';

interface Iprops {
  children?: ReactElement<any, string | JSXElementConstructor<any>> | undefined;
  redirect?: string;
}

function PrivateRoute({ children, redirect = `/${pageRoutes.login}` }: Iprops) {
  let auth = useAuth();
  let location = useLocation();

  if (auth?.tokenStatus === 'not set') {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.

    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  return <PrivateLayout>{children ? children : <Outlet />}</PrivateLayout>;
}

export { PrivateRoute };
