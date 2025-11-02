import { useAuth } from 'hooks';
import { Navigate } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';

interface IProps {
  children: JSX.Element;
}

/**
 * Route guard that only allows admin role
 */
function AdminRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  
  if (auth?.tokenStatus !== 'valid') {
    return <Navigate to={`/${pageRoutes.login}`} replace />;
  }

  if (auth?.result?.role !== 'admin') {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
}

export { AdminRoute };
