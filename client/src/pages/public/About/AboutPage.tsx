import { Container } from 'components';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode } from 'react';

export const AboutPage = () => {
  const title: ReactNode = usePageTitle();
  return (
    <>
      {title}
      <Container style={{ paddingTop: '50px' }}>
        <h1>About Page</h1>
      </Container>
    </>
  );
};
