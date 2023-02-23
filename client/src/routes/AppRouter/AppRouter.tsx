import { useAuth } from 'hooks';
import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import PrivateRoute from 'routes/PrivateRoute';

const General = lazy(() => import('layouts/General'));

const Home = lazy(() => import('pages/public/Home'));
const Contact = lazy(() => import('pages/public/Contact'));
const About = lazy(() => import('pages/public/About'));
const Login = lazy(() => import('pages/public/Auth/Login'));
const Register = lazy(() => import('pages/public/Auth/Register'));
const ForgotPassword = lazy(() => import('pages/public/Auth/Forgot'));
const PrivacyPolicy = lazy(() => import('pages/public/PrivacyPolicy'));
const NotFound = lazy(() => import('pages/public/NotFound'));
const SingleProduct = lazy(() => import('pages/public/Products/Single'));

const UserPrivacyPolicy = lazy(
  () => import('pages/private/User/PrivacyPolicy')
);
const Profile = lazy(() => import('pages/private/User/Profile'));
const Dashboard = lazy(() => import('pages/private/User/Dashboard'));
const UserSettings = lazy(() => import('pages/private/User/Settings'));
const UserProducts = lazy(() => import('pages/private/Products/Display'));

const AppRouter = () => {
  const auth = useAuth();
  const isAuthenticated = auth?.token;

  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<General />}>
          <Route index element={<Home />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="products/:id" element={<SingleProduct />} />

          <Route path="user" element={<PrivateRoute redirect="/login" />}>
            <Route index element={<Profile />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<UserSettings />} />
            <Route path="products" element={<UserProducts />} />
          </Route>

          {isAuthenticated ? (
            <Route
              path="/"
              element={<PrivateRoute redirect="/privacy-policy" />}
            >
              <Route path="privacy-policy" element={<UserPrivacyPolicy />} />
            </Route>
          ) : (
            <Route path="/">
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
            </Route>
          )}

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export { AppRouter };
