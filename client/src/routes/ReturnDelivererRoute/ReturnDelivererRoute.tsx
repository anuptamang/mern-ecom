import { useAuth } from 'hooks';
import { Navigate } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';

interface IProps {
  children: JSX.Element;
}

/**
 * Route guard that only allows delivery_person with customer_return type and admin roles
 */
function ReturnDelivererRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  
  if (auth?.tokenStatus !== 'valid') {
    return <Navigate to={`/${pageRoutes.login}`} replace />;
  }

  // Allow admin or delivery_person with customer_return delivererType
  const userRole = auth?.result?.role;
  const delivererType = auth?.result?.delivererType;
  
  if (userRole === 'admin') {
    return children;
  }
  
  if (userRole === 'delivery_person' && delivererType === 'customer_return') {
    return children;
  }
  
  // Redirect unauthorized users to their dashboard
  return <Navigate to="/user/dashboard" replace />;
}

export { ReturnDelivererRoute };
