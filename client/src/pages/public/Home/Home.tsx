import { Loading } from 'components';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { fetchProducts } from 'redux/action/productsAction';
import { productsFilterSelector, productsSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';

const Home = () => {
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
        <title>Home | My App</title>
      </Helmet>
      {status.success && JSON.stringify(productList)}
      {status.loading && <Loading />}
    </>
  );
};

export { Home };
