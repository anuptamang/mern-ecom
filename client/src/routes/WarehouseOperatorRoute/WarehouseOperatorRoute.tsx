import { Navigate, useLocation } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import { useAuth } from 'hooks';

interface IProps {
  children: React.ReactNode;
}

function WarehouseOperatorRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (auth?.tokenStatus === 'not set') {
    return <Navigate to={`/${pageRoutes.login}`} state={{ from: location }} replace />;
  }

  // If authenticated but not a warehouse operator, redirect to dashboard
  if (auth?.tokenStatus === 'valid' && auth?.result?.role !== 'warehouse_operator') {
    return <Navigate to={`/${pageRoutes.userDashboard}`} replace />;
  }

  return <>{children}</>;
}

export { WarehouseOperatorRoute };
