import { useAuth } from 'hooks';
import { Navigate } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';

interface IProps {
  children: JSX.Element;
}

/**
 * Route guard that only allows buyers, sellers, and unauthenticated users to access the route
 * Blocks delivery_agency, delivery_person, warehouse_operator, support, finance, admin, etc.
 */
function BuyerSellerRoute({ children }: IProps): JSX.Element | null {
  const auth = useAuth();
  
  // Allow unauthenticated users (public access)
  if (auth?.tokenStatus !== 'valid') {
    return children;
  }

  // Block delivery users, finance, support, verification, inspector, and admin from accessing products
  const blockedRoles = [
    'delivery_agency', 
    'delivery_person', 
    'warehouse_operator', 
    'finance', 
    'support', 
    'support_user', 
    'verification_team', 
    'return_inspector',
    'return_deliverer',
    'admin'
  ];
  
  if (auth?.result?.role && blockedRoles.includes(auth.result.role)) {
    // Redirect to their respective dashboard
    if (auth.result.role === 'admin') {
      return <Navigate to="/user/admin" replace />;
    } else if (auth.result.role === 'delivery_agency') {
      return <Navigate to="/user/delivery-agency" replace />;
    } else if (auth.result.role === 'delivery_person') {
      // Check if it's a return deliverer
      if (auth.result.delivererType === 'customer_return') {
        return <Navigate to="/user/return-deliverer" replace />;
      }
      return <Navigate to="/user/delivery-person" replace />;
    } else if (auth.result.role === 'warehouse_operator') {
      return <Navigate to="/user/warehouse-operator" replace />;
    } else if (auth.result.role === 'finance') {
      return <Navigate to="/user/finance" replace />;
    } else if (auth.result.role === 'support' || auth.result.role === 'support_user') {
      return <Navigate to="/user/support" replace />;
    } else if (auth.result.role === 'verification_team') {
      return <Navigate to="/user/verification" replace />;
    } else if (auth.result.role === 'return_inspector') {
      return <Navigate to="/user/inspector" replace />;
    } else if (auth.result.role === 'return_deliverer') {
      return <Navigate to="/user/return-deliverer" replace />;
    }
  }

  // Allow buyers, sellers, and unauthenticated users
  return children;
}

export { BuyerSellerRoute };
