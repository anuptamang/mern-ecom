import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode } from 'react';
import styles from 'assets/styles/Common.module.scss';

export const AboutPage = () => {
  const title: ReactNode = usePageTitle();
  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <h1>About Page</h1>
      </Container>
    </>
  );
};
