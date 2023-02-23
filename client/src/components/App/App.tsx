import { ScrollToTop } from 'components/UI';
import { Suspense, lazy } from 'react';

const AppRouter = lazy(() => import('routes/AppRouter'));

function App() {
  return (
    <>
      <Suspense fallback={null}>
        <ScrollToTop />
        <AppRouter />
      </Suspense>
    </>
  );
}

export { App };
