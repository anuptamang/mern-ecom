import { Navigate, useLocation } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import { useAuth } from 'hooks';

interface IProps {
  children: React.ReactNode;
}

function DeliveryAgencyRoute({ children }: IProps) {
  const auth = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (auth?.tokenStatus === 'not set') {
    return <Navigate to={`/${pageRoutes.login}`} state={{ from: location }} replace />;
  }

  // If authenticated but not a delivery agency, redirect to dashboard
  if (auth?.tokenStatus === 'valid' && auth?.result?.role !== 'delivery_agency') {
    return <Navigate to={`/${pageRoutes.userDashboard}`} replace />;
  }

  return children || null;
}

export { DeliveryAgencyRoute };

