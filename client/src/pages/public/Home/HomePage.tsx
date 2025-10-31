import { Container } from 'components/UI';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode, useEffect, useState } from 'react';
import { fetchProducts } from 'redux/action/products';
import { productsSelector } from 'redux/slice';
import { useAppDispatch, useAppSelector } from 'redux/store';
import { Button, Card, List, Image, message, Tag, Tabs, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ProductImagePlaceholder } from 'components/ProductImageGallery/ProductImagePlaceholder';
import { addToCart, fetchMyCart } from 'redux/slice/carts/cartsSlice';
import { authSelector } from 'redux/slice';
import styles from 'assets/styles/Common.module.scss';
import './HomePage.scss';

const HomePage = () => {
  const title: ReactNode = usePageTitle();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { productList, status } = useAppSelector(productsSelector);
  const { result } = useAppSelector(authSelector);
  const isSeller = result?.role === 'seller';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, any[]>>({});

  // Get unique categories from products
  const allProducts = productList?.data || [];
  const categories = Array.from(
    new Set(
      allProducts.flatMap((p: any) => p.categories || [])
    )
  ).filter(Boolean) as string[];

  useEffect(() => {
    // Fetch all products on mount
    dispatch(fetchProducts({ category: null }));
  }, [dispatch]);

  useEffect(() => {
    // Group products by category
    const grouped: Record<string, any[]> = {};
    allProducts.forEach((product: any) => {
      if (product.categories && product.categories.length > 0) {
        product.categories.forEach((cat: string) => {
          if (!grouped[cat]) {
            grouped[cat] = [];
          }
          grouped[cat].push(product);
        });
      }
      // Also add to "All" category
      if (!grouped['All']) {
        grouped['All'] = [];
      }
      grouped['All'].push(product);
    });
    setCategoryProducts(grouped);
  }, [allProducts]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'All' ? null : category);
  };

  const handleCardClick = (productId: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.ant-btn') ||
      target.closest('.product-card-actions') ||
      target.tagName === 'A'
    ) {
      return;
    }
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (productId: string, stock: number, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

    dispatch(addToCart({ productId })).then(() => {
      message.success(`${title} added to cart`);
      dispatch(fetchMyCart());
    }).catch((error: any) => {
      message.error(error?.message || 'Failed to add product to cart');
    });
  };

  const productsToShow = selectedCategory
    ? categoryProducts[selectedCategory] || []
    : allProducts;

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <div className="homepage">
          <h1>Shop by Category</h1>
          
          {categories.length > 0 && (
            <Tabs
              activeKey={selectedCategory || 'All'}
              onChange={handleCategoryChange}
              className="category-tabs"
              items={[
                { key: 'All', label: 'All Products' },
                ...categories.map((cat) => ({
                  key: cat,
                  label: cat.charAt(0).toUpperCase() + cat.slice(1),
                })),
              ]}
            />
          )}

          <Spin spinning={status.loading}>
            {productsToShow.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <p>No products found in this category.</p>
                </div>
              </Card>
            ) : (
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
                dataSource={productsToShow}
                renderItem={(item: any) => (
                  <List.Item>
                    <Card
                      className="product-card"
                      onClick={(e) => handleCardClick(item._id, e)}
                      cover={
                        item.thumbnail ? (
                          <div className="product-image-wrapper">
                            <Image
                              alt={item.title}
                              src={item.thumbnail}
                              preview={false}
                              className="product-image"
                            />
                          </div>
                        ) : (
                          <div className="product-image-wrapper">
                            <ProductImagePlaceholder title={item.title || 'Product'} />
                          </div>
                        )
                      }
                      actions={[
                        <div key="view" className="product-card-actions">
                          <Button
                            type="link"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/products/${item._id}`);
                            }}
                          >
                            View
                          </Button>
                        </div>,
                        <div key="cart" className="product-card-actions">
                          {!isSeller && result ? (
                            <Button
                              type="primary"
                              size="small"
                              disabled={(item.stock || 0) <= 0}
                              onClick={(e) => handleAddToCart(item._id, item.stock || 0, item.title, e)}
                            >
                              Add to Cart
                            </Button>
                          ) : !result ? (
                            <Button
                              type="primary"
                              size="small"
                              disabled={(item.stock || 0) <= 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                message.warning('Please log in to add items to cart');
                              }}
                            >
                              Add to Cart
                            </Button>
                          ) : null}
                        </div>,
                      ]}
                      hoverable
                    >
                      <Card.Meta
                        title={item.title}
                        description={
                          <div className="product-meta">
                            {item.body?.summary || item.description || 'No description available.'}
                            {item.price && (
                              <div className="product-price">${item.price.toFixed(2)}</div>
                            )}
                            <div className="product-stock">
                              {item.stock !== undefined ? (
                                <span className={item.stock > 0 ? 'stock-available' : 'stock-out'}>
                                  {item.stock > 0 ? `In Stock (${item.stock})` : 'Out of Stock'}
                                </span>
                              ) : (
                                <span className="stock-unknown">Stock information unavailable</span>
                              )}
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Spin>
        </div>
      </Container>
    </>
  );
};

export { HomePage };
