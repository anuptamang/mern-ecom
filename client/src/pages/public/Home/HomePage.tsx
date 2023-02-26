import { Container, Loading } from 'components';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchProducts } from 'redux/action/products';
import { productsFilterSelector, productsSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { productList, status } = useAppSelector(productsSelector);
  const { category } = useAppSelector(productsFilterSelector);

  useEffect(() => {
    if (productList.data.length < 1) {
      dispatch(fetchProducts({ category }));
    }
  }, [category, dispatch, productList.data.length]);

  if (status.error) {
    return <div>Error</div>;
  }

  return (
    <>
      <Helmet>
        <title>Home | My Shop</title>
      </Helmet>
      <Container>
        {status.success && JSON.stringify(productList)}
        {status.loading && <Loading />}
      </Container>
    </>
  );
};

export { HomePage };
