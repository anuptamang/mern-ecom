import { Container, Loading } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode, useEffect } from 'react';
import { fetchProducts } from 'redux/action/products';
import { productsFilterSelector, productsSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';
import styles from 'assets/styles/Common.module.scss';

const HomePage = () => {
  const title: ReactNode = usePageTitle();

  const dispatch = useAppDispatch();
  const { productList, status } = useAppSelector(productsSelector);
  const { category } = useAppSelector(productsFilterSelector);

  useEffect(() => {
    if (productList.data.length < 1) {
      dispatch(fetchProducts({ category }));
    }
  }, [category, dispatch, productList.data.length]);

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        {status.success && JSON.stringify(productList)}
        {status.loading && <Loading />}
      </Container>
    </>
  );
};

export { HomePage };
