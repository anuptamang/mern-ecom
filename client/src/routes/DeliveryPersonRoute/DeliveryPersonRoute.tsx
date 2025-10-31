import { Navigate, useLocation } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import { useAuth } from 'hooks';

interface IProps {
  children: React.ReactNode;
}

function DeliveryPersonRoute({ children }: IProps) {
  const auth = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (auth?.tokenStatus === 'not set') {
    return <Navigate to={`/${pageRoutes.login}`} state={{ from: location }} replace />;
  }

  // If authenticated but not a delivery person, redirect to dashboard
  if (auth?.tokenStatus === 'valid' && auth?.result?.role !== 'delivery_person') {
    return <Navigate to={`/${pageRoutes.userDashboard}`} replace />;
  }

  return children || null;
}

export { DeliveryPersonRoute };

