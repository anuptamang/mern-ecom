import { Button, Card, Spin, message } from 'antd';
import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode, useEffect, useState } from 'react';
import styles from 'assets/styles/Common.module.scss';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { addToCart } from 'redux/slice/carts/cartsSlice';
import { authSelector } from 'redux/slice';
import { fetchProductByIdApi } from 'services/endPoints/products/productsEndpoints';

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
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';

  useEffect(() => {
    if (!id) {
      setError('Product ID is required');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchProductByIdApi(id)
      .then((res) => {
        if (isMounted) {
          setProduct(res.data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load product');
          setLoading(false);
          message.error('Failed to load product details');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" tip="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-500">{error || 'Product not found'}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card cover={product.thumbnail ? <img alt={product.title} src={product.thumbnail} /> : null}>
      <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
      <div className="mb-4">{product.body?.summary || product.description || ''}</div>
      {product.price && (
        <div className="text-2xl font-bold mb-4 text-blue-600">${product.price}</div>
      )}
      {!isSeller && result && (
        <Button type="primary" onClick={() => dispatch(addToCart({ productId: product._id }))}>
          Add to Cart
        </Button>
      )}
      {isSeller && (
        <div className="text-gray-500 italic">Sellers cannot purchase products</div>
      )}
      {!result && (
        <div className="text-gray-500 italic">Please log in to add items to cart</div>
      )}
    </Card>
  );
};
