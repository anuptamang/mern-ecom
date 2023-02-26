import { useAuth } from 'hooks';
import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from 'routes/PrivateRoute';

const General = lazy(() => import('layouts/General'));

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

const AppRouter = () => {
  const auth = useAuth();
  const isAuthenticated = auth?.token;

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<General />}>
          <Route index element={<HomePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="products/:id" element={<SingleProductPage />} />

          <Route path="user" element={<PrivateRoute redirect="/login" />}>
            <Route index element={<UserProfilePage />} />
            <Route path="dashboard" element={<UserDashboardPage />} />
            <Route path="profile" element={<UserProfilePage />} />
            <Route path="settings" element={<UserSettingsPage />} />
            <Route path="products" element={<ProductsDashboardPage />} />
          </Route>

          {isAuthenticated ? (
            <Route
              path="/"
              element={<PrivateRoute redirect="/privacy-policy" />}
            >
              <Route
                path="privacy-policy"
                element={<UserPrivacyPolicyPage />}
              />
            </Route>
          ) : (
            <Route path="/">
              <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            </Route>
          )}

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export { AppRouter };
