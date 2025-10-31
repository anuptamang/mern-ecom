import { Button, Card } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode, useEffect, useState } from 'react';
import styles from 'assets/styles/Common.module.scss';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { addToCart } from 'redux/slice/carts/cartsSlice';
import { authSelector } from 'redux/slice';

type Props = {};

const ProductsSinglePage = (props: Props) => {
  const title: ReactNode = usePageTitle();

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <ProductDetails />
      </Container>
    </>
  );
};

export { ProductsSinglePage };

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>();
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';

  useEffect(() => {
    let isMounted = true;
    axios.get(`/products/${id}`).then((res) => {
      if (isMounted) setProduct(res.data);
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (!product) return null;

  return (
    <Card cover={product.thumbnail ? <img alt={product.title} src={product.thumbnail} /> : null}>
      <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
      <div className="mb-4">{product.body?.summary || ''}</div>
      {!isSeller && result && (
        <Button type="primary" onClick={() => dispatch(addToCart({ productId: product._id }))}>
          Add to Cart
        </Button>
      )}
      {isSeller && (
        <div className="text-gray-500 italic">Sellers cannot purchase products</div>
      )}
    </Card>
  );
};
