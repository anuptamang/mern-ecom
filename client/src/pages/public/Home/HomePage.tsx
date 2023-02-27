import { Container, Loading } from 'components';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchProducts } from 'redux/action/products';
import { productsFilterSelector, productsSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';

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

  if (status.error.message) {
    return <div>{status.error.message}</div>;
  }

  return (
    <>
      {title}
      <Container>
        {status.success && JSON.stringify(productList)}
        {status.loading && <Loading />}
      </Container>
    </>
  );
};

export { HomePage };
