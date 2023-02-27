import { Container } from 'components';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode } from 'react';

export const AboutPage = () => {
  const title: ReactNode = usePageTitle();
  return (
    <>
      {title}
      <Container>
        <h1>About Page</h1>
      </Container>
    </>
  );
};
