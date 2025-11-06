'use client';

import { Col, Row } from 'antd';
import { Container } from '@/components/UI';
import { pageRoutes } from '@/data/static/pageRoutes';
import { LoginForm } from '@/features';
import { useAuth } from '@/hooks';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LoginPage = () => {
  const auth = useAuth();
  const router = useRouter();
  const title = usePageTitle();

  useEffect(() => {
    if (auth?.tokenStatus === 'valid') {
      // Check profile completion - redirect to profile if incomplete
      const profileCompleted = auth?.result?.profileCompleted;
      const profileCompletion = auth?.result?.profileCompletion;

      if (
        !profileCompleted &&
        profileCompletion !== undefined &&
        profileCompletion < 100
      ) {
        // Redirect to profile page to complete profile
        router.replace(`/${pageRoutes.user}/profile`);
        return;
      }

      // Redirect them to the dashboard
      router.replace(`/${pageRoutes.userDashboard}`);
    }
  }, [auth?.tokenStatus, auth?.result, router]);

  if (auth?.tokenStatus === 'valid') {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      {title}
      <Container style={{ paddingTop: '50px', paddingBottom: '50px' }}>
        <Row justify={'center'}>
          <Col md={10}>
            <LoginForm />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export { LoginPage };
