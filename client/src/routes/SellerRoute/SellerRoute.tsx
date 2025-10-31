import { useAuth } from 'hooks';
import { Navigate, useLocation } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import { ReactElement, JSXElementConstructor } from 'react';

interface IProps {
  children?: ReactElement<any, string | JSXElementConstructor<any>> | undefined;
}

function SellerRoute({ children }: IProps) {
  const auth = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (auth?.tokenStatus === 'not set') {
    return <Navigate to={`/${pageRoutes.login}`} state={{ from: location }} replace />;
  }

  // If authenticated but not a seller, redirect to dashboard
  if (auth?.tokenStatus === 'valid' && auth?.result?.role !== 'seller') {
    return <Navigate to={`/${pageRoutes.userDashboard}`} replace />;
  }

  return children || null;
}

export { SellerRoute };

