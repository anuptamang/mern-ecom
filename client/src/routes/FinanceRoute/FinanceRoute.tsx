import { useAuth } from 'hooks';
import { Navigate } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';

interface IProps {
  children: JSX.Element;
}

/**
 * Route guard that only allows finance and admin roles
 */
function FinanceRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  
  if (auth?.tokenStatus !== 'valid') {
    return <Navigate to={`/${pageRoutes.login}`} replace />;
  }

  const allowedRoles = ['finance', 'admin'];
  if (auth?.result?.role && !allowedRoles.includes(auth.result.role)) {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
}

export { FinanceRoute };
