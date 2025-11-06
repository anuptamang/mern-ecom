import { pageRoutes } from '@/data/static/pageRoutes';
import { useAuth } from '@/hooks';
import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from '@/routes/PrivateRoute';
import { SellerRoute } from '@/routes/SellerRoute';
import { BuyerOnlyRoute } from '@/routes/BuyerOnlyRoute/BuyerOnlyRoute';
import { BuyerSellerRoute } from '@/routes/BuyerSellerRoute/BuyerSellerRoute';
import { DeliveryAgencyRoute } from '@/routes/DeliveryAgencyRoute/DeliveryAgencyRoute';
import { DeliveryPersonRoute } from '@/routes/DeliveryPersonRoute/DeliveryPersonRoute';
import { WarehouseOperatorRoute } from '@/routes/WarehouseOperatorRoute/WarehouseOperatorRoute';
import { SupportRoute } from '@/routes/SupportRoute/SupportRoute';
import { VerificationRoute } from '@/routes/VerificationRoute/VerificationRoute';
import { InspectorRoute } from '@/routes/InspectorRoute/InspectorRoute';
import { FinanceRoute } from '@/routes/FinanceRoute/FinanceRoute';
import { ReturnDelivererRoute } from '@/routes/ReturnDelivererRoute/ReturnDelivererRoute';
import { AdminRoute } from '@/routes/AdminRoute/AdminRoute';

const GeneralLayout = lazy(() => import('layouts/General'));

const HomePage = lazy(() => import('pages/public/Home'));
const ContactPage = lazy(() => import('pages/public/Contact'));
const AboutPage = lazy(() => import('pages/public/About'));
const LoginPage = lazy(() => import('pages/public/Auth/Login'));
const RegisterPage = lazy(() => import('pages/public/Auth/Register'));
const ForgotPasswordPage = lazy(() => import('pages/public/Auth/Forgot'));
const PrivacyPolicyPage = lazy(() => import('pages/public/PrivacyPolicy'));
const DocumentationPage = lazy(() => import('pages/public/Documentation'));
const NotFoundPage = lazy(() => import('pages/public/NotFound'));
const ProductsHomePage = lazy(() => import('pages/public/Products/Home'));
const SingleProductPage = lazy(() => import('pages/public/Products/Single'));

const UserPrivacyPolicyPage = lazy(
  () => import('pages/private/User/PrivacyPolicy')
);
const UserProfilePage = lazy(() => import('pages/private/User/Profile'));
const UserDashboardPage = lazy(() => import('pages/private/User/Dashboard'));
const UserSettingsPage = lazy(() => import('pages/private/User/Settings'));
const ProductsDashboardPage = lazy(
  () => import('pages/private/Products/Dashboard')
);
const CartsDashboard = lazy(() => import('pages/private/Carts/Dashboard'));
const OrdersDashboard = lazy(() => import('pages/private/Orders/Dashboard'));
const UserCheckoutPage = lazy(() => import('pages/private/User/Checkout'));
const WishlistDashboard = lazy(
  () => import('pages/private/Wishlist/Dashboard')
);
const ReturnsDashboard = lazy(() => import('pages/private/Returns/Dashboard'));
const DeliveryAgencyDashboard = lazy(
  () => import('pages/private/DeliveryAgency/Dashboard')
);
const DeliveryPersonDashboard = lazy(
  () => import('pages/private/DeliveryPerson/Dashboard')
);
const WarehouseOperatorDashboard = lazy(
  () => import('pages/private/WarehouseOperator/Dashboard')
);
const SupportDashboard = lazy(() => import('pages/private/Support/Dashboard'));
const VerificationTeamDashboard = lazy(() => import('pages/private/VerificationTeam/Dashboard'));
const InspectorDashboard = lazy(() => import('pages/private/Inspector/Dashboard'));
const FinanceDashboard = lazy(() => import('pages/private/Finance/Dashboard'));
const ReturnDelivererDashboard = lazy(() => import('pages/private/ReturnDeliverer/Dashboard'));
const AdminDashboard = lazy(() => import('pages/private/Admin/Dashboard'));
const AdminSettings = lazy(() => import('pages/private/Admin/Settings'));
const ChatsDashboard = lazy(() => import('pages/private/Chats/Dashboard'));

const AppRouter = () => {
  const auth = useAuth();
  const isAuthenticated = auth?.tokenStatus === 'valid' ? true : false;

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path={pageRoutes.home} element={<GeneralLayout />}>
          <Route index element={<HomePage />} />
          <Route path={pageRoutes.contact} element={<ContactPage />} />
          <Route path={pageRoutes.about} element={<AboutPage />} />
          <Route path={pageRoutes.login} element={<LoginPage />} />
          <Route path={pageRoutes.register} element={<RegisterPage />} />
          <Route
            path={pageRoutes.forgotPassword}
            element={<ForgotPasswordPage />}
          />
          <Route
            path={`${pageRoutes.products}/:id`}
            element={
              <BuyerSellerRoute>
                <SingleProductPage />
              </BuyerSellerRoute>
            }
          />
          <Route
            path={pageRoutes.products}
            element={
              <BuyerSellerRoute>
                <ProductsHomePage />
              </BuyerSellerRoute>
            }
          />

          {/* Privacy Policy - Always use GeneralLayout so header is visible for all users */}
          <Route
            path={pageRoutes.privacyPolicy}
            element={
              isAuthenticated ? (
                <UserPrivacyPolicyPage />
              ) : (
                <PrivacyPolicyPage />
              )
            }
          />

          <Route
            path={pageRoutes.user}
            element={<PrivateRoute redirect={`/${pageRoutes.login}`} />}
          >
            <Route index element={<UserProfilePage />} />
            <Route
              path={pageRoutes.dashboard}
              element={<UserDashboardPage />}
            />
            <Route path={pageRoutes.profile} element={<UserProfilePage />} />
            <Route path={pageRoutes.settings} element={<UserSettingsPage />} />
            <Route
              path={pageRoutes.products}
              element={
                <SellerRoute>
                  <ProductsDashboardPage />
                </SellerRoute>
              }
            />
            <Route 
              path={pageRoutes.carts} 
              element={
                <BuyerOnlyRoute>
                  <CartsDashboard />
                </BuyerOnlyRoute>
              } 
            />
            <Route 
              path={'orders'} 
              element={
                <BuyerOnlyRoute>
                  <OrdersDashboard />
                </BuyerOnlyRoute>
              } 
            />
            <Route 
              path={'checkout'} 
              element={
                <BuyerOnlyRoute>
                  <UserCheckoutPage />
                </BuyerOnlyRoute>
              } 
            />
            <Route 
              path={'wishlist'} 
              element={
                <BuyerOnlyRoute>
                  <WishlistDashboard />
                </BuyerOnlyRoute>
              } 
            />
            <Route 
              path={'returns'} 
              element={
                <BuyerOnlyRoute>
                  <ReturnsDashboard />
                </BuyerOnlyRoute>
              } 
            />
            <Route 
              path={'chats'} 
              element={
                <BuyerOnlyRoute>
                  <ChatsDashboard />
                </BuyerOnlyRoute>
              } 
            />
            <Route
              path={'delivery-agency'}
              element={
                <DeliveryAgencyRoute>
                  <DeliveryAgencyDashboard />
                </DeliveryAgencyRoute>
              }
            />
            <Route
              path={'delivery-person'}
              element={
                <DeliveryPersonRoute>
                  <DeliveryPersonDashboard />
                </DeliveryPersonRoute>
              }
            />
            <Route
              path={'warehouse-operator'}
              element={
                <WarehouseOperatorRoute>
                  <WarehouseOperatorDashboard />
                </WarehouseOperatorRoute>
              }
            />
            <Route
              path={'support'}
              element={
                <SupportRoute>
                  <SupportDashboard />
                </SupportRoute>
              }
            />
            <Route
              path={'verification'}
              element={
                <VerificationRoute>
                  <VerificationTeamDashboard />
                </VerificationRoute>
              }
            />
            <Route
              path={'inspector'}
              element={
                <InspectorRoute>
                  <InspectorDashboard />
                </InspectorRoute>
              }
            />
            <Route
              path={'finance'}
              element={
                <FinanceRoute>
                  <FinanceDashboard />
                </FinanceRoute>
              }
            />
            <Route
              path={'return-deliverer'}
              element={
                <ReturnDelivererRoute>
                  <ReturnDelivererDashboard />
                </ReturnDelivererRoute>
              }
            />
            <Route
              path={'admin'}
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path={'admin/settings'}
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export { AppRouter };
