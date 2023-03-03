import { Container } from 'components';
import { usePageTitle } from 'hooks/usePageTitle';
import styles from 'assets/styles/Common.module.scss';

type TProps = {};

const ProductsHome = (props: TProps) => {
  const title = usePageTitle();

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <h1>All Products</h1>
      </Container>
    </>
  );
};

export { ProductsHome };
