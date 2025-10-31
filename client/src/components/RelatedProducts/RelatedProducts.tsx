import { Card, List, Image, Button, Tag, Empty, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ProductImagePlaceholder } from 'components/ProductImageGallery/ProductImagePlaceholder';
import { addToCart, fetchMyCart } from 'redux/slice/carts/cartsSlice';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { authSelector } from 'redux/slice';
import { message } from 'antd';
import './RelatedProducts.scss';

type RelatedProductsProps = {
  products: any[];
  loading?: boolean;
};

export const RelatedProducts = ({ products, loading = false }: RelatedProductsProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';

  const handleAddToCart = async (productId: string, title: string, stock: number) => {
    if (!result) {
      message.warning('Please log in to add items to cart');
      return;
    }

    if (isSeller) {
      message.warning('Sellers cannot purchase products');
      return;
    }

    if (stock <= 0) {
      message.error('Product is out of stock');
      return;
    }

    try {
      await dispatch(addToCart({ productId })).unwrap();
      message.success(`${title} added to cart`);
      dispatch(fetchMyCart());
    } catch (error: any) {
      message.error(error?.message || 'Failed to add product to cart');
    }
  };

  if (loading) {
    return (
      <div className="related-products">
        <Card title="Related Products" className="related-products-card">
          <Spin tip="Loading related products..." />
        </Card>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="related-products">
      <Card title="Related Products" className="related-products-card">
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={products}
          renderItem={(item: any) => (
            <List.Item>
              <Card
                className="related-product-card"
                cover={
                  item.thumbnail ? (
                    <div className="product-image-wrapper" onClick={() => navigate(`/products/${item._id}`)}>
                      <Image
                        alt={item.title}
                        src={item.thumbnail}
                        preview={false}
                        className="product-image"
                      />
                    </div>
                  ) : (
                    <div className="product-image-wrapper" onClick={() => navigate(`/products/${item._id}`)}>
                      <ProductImagePlaceholder title={item.title || 'Product'} />
                    </div>
                  )
                }
                actions={[
                  <Button
                    key="view"
                    type="link"
                    onClick={() => navigate(`/products/${item._id}`)}
                  >
                    View
                  </Button>,
                  !isSeller && result ? (
                    <Button
                      key="cart"
                      type="primary"
                      size="small"
                      disabled={(item.stock || 0) <= 0}
                      onClick={() => handleAddToCart(item._id, item.title, item.stock || 0)}
                    >
                      Add to Cart
                    </Button>
                  ) : null,
                ].filter(Boolean)}
                hoverable
              >
                <Card.Meta
                  title={
                    <div onClick={() => navigate(`/products/${item._id}`)} style={{ cursor: 'pointer' }}>
                      {item.title}
                    </div>
                  }
                  description={
                    <div className="related-product-meta">
                      {item.body?.summary || item.description || ''}
                      {item.price && (
                        <div className="related-product-price">${item.price.toFixed(2)}</div>
                      )}
                      <div className="related-product-stock">
                        {item.stock !== undefined ? (
                          <span className={item.stock > 0 ? 'stock-available' : 'stock-out'}>
                            {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
