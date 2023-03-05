import styles from 'assets/styles/Common.module.scss';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';

const ContactPage = () => {
  const title = usePageTitle();

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <h1>Contact Page</h1>
      </Container>
    </>
  );
};

export { ContactPage };
