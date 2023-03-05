import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode } from 'react';
import styles from 'assets/styles/Common.module.scss';

type Props = {};

const ProductsSinglePage = (props: Props) => {
  const title: ReactNode = usePageTitle();

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <h1>Product Single Page</h1>
      </Container>
    </>
  );
};

export { ProductsSinglePage };
