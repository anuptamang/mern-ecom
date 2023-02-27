import { pageRoutes } from 'data/static/pageRoutes';
import { useAuth } from 'hooks';
import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from 'routes/PrivateRoute';

const GeneralLayout = lazy(() => import('layouts/General'));

const HomePage = lazy(() => import('pages/public/Home'));
const ContactPage = lazy(() => import('pages/public/Contact'));
const AboutPage = lazy(() => import('pages/public/About'));
const LoginPage = lazy(() => import('pages/public/Auth/Login'));
const RegisterPage = lazy(() => import('pages/public/Auth/Register'));
const ForgotPasswordPage = lazy(() => import('pages/public/Auth/Forgot'));
const PrivacyPolicyPage = lazy(() => import('pages/public/PrivacyPolicy'));
const NotFoundPage = lazy(() => import('pages/public/NotFound'));
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

const AppRouter = () => {
  const auth = useAuth();
  const isAuthenticated = auth?.token;

  return (
    <Suspense fallback={null}>
      <Routes>
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
            element={<SingleProductPage />}
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
              element={<ProductsDashboardPage />}
            />
            <Route path={pageRoutes.carts} element={<CartsDashboard />} />
          </Route>

          {isAuthenticated ? (
            <Route
              path={pageRoutes.home}
              element={
                <PrivateRoute redirect={`${pageRoutes.privacyPolicy}`} />
              }
            >
              <Route
                path={pageRoutes.privacyPolicy}
                element={<UserPrivacyPolicyPage />}
              />
            </Route>
          ) : (
            <Route path={pageRoutes.home}>
              <Route
                path={pageRoutes.privacyPolicy}
                element={<PrivacyPolicyPage />}
              />
            </Route>
          )}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export { AppRouter };
