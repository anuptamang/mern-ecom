'use client';

import { Col, Row } from 'antd';
import { Container } from '@/components/UI';
import { pageRoutes } from '@/data/static/pageRoutes';
import { ForgotForm } from '@/features/ForgotForm';
import { useAuth } from '@/hooks';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ForgotPage = () => {
  const auth = useAuth();
  const router = useRouter();
  const title = usePageTitle();

  useEffect(() => {
    if (auth?.tokenStatus === 'valid') {
      // Redirect them to the dashboard
      router.replace(`/${pageRoutes.userDashboard}`);
    }
  }, [auth?.tokenStatus, router]);

  if (auth?.tokenStatus === 'valid') {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      {title}
      <Container style={{ paddingTop: '50px', paddingBottom: '50px' }}>
        <Row justify={'center'}>
          <Col md={10}>
            <ForgotForm />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export { ForgotPage };
