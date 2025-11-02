import { Container } from 'components/UI';
import { AuthModal, HeroBanner } from 'components';
import { usePageTitle } from 'hooks/usePageTitle';
import { ReactNode, useEffect, useState } from 'react';
import { fetchProducts } from 'redux/action/products';
import { productsSelector } from 'redux/slice';
import { useAppSelector, useAppDispatch } from 'redux/store';
import { Button, Card, List, Image, message, Tag, Tabs, Spin, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { pageRoutes } from 'data/static/pageRoutes';
import { ProductImagePlaceholder } from 'components/ProductImageGallery/ProductImagePlaceholder';
import { addToCart, fetchMyCart } from 'redux/slice/carts/cartsSlice';
import { authSelector } from 'redux/slice';
import { WishlistButton } from 'components/WishlistButton';
import { ROLES, canSeeHeroBanner, LABELS } from '../../../constants';
import styles from 'assets/styles/Common.module.scss';
import './HomePage.scss';
import { FireOutlined } from '@ant-design/icons';
import { 
  CarOutlined, 
  TeamOutlined, 
  SafetyOutlined, 
  BankOutlined, 
  UserOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  ShopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const title: ReactNode = usePageTitle();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { productList, status } = useAppSelector(productsSelector);
  const { result, token } = useAppSelector(authSelector);
  const userRole = result?.role;
  const isSeller = result?.role === ROLES.SELLER;
  const isBuyer = result?.role === ROLES.BUYER;
  const isPublic = !result?._id || !token || result?._id === '';
  const isDeliveryUser = userRole === 'delivery_agency' || 
                         userRole === 'delivery_person' || 
                         userRole === 'warehouse_operator' ||
                         userRole === 'support' ||
                         userRole === 'support_user' ||
                         userRole === 'verification_team' ||
                         userRole === 'return_inspector' ||
                         userRole === 'return_deliverer' ||
                         userRole === 'finance' ||
                         userRole === 'admin';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<Record<string, any[]>>({});
  const [displayedProductsCount, setDisplayedProductsCount] = useState<number>(12);

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

  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);
  const [pendingProductTitle, setPendingProductTitle] = useState<string>('');

  const handleAddToCart = (productId: string, stock: number, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!result) {
      // Store the product info for after login
      setPendingProductId(productId);
      setPendingProductTitle(title);
      setAuthModalVisible(true);
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

    dispatch(addToCart({ productId }))
      .unwrap()
      .then(() => {
        message.success(`${title} added to cart`);
        dispatch(fetchMyCart());
      })
      .catch((error: any) => {
        // If error is about needing to log in, open auth modal instead of showing error
        const errorMessage = error?.message || error?.payload || String(error);
        if (errorMessage.includes('log in') || errorMessage.includes('Please log in')) {
          setPendingProductId(productId);
          setPendingProductTitle(title);
          setAuthModalVisible(true);
        } else if (error?.response?.status !== 401) {
          message.error(errorMessage || 'Failed to add product to cart');
        }
      });
  };

  const handleAuthSuccess = async () => {
    if (pendingProductId) {
      // After successful login/register, add the item to cart
      try {
        await dispatch(addToCart({ productId: pendingProductId })).unwrap();
        message.success(`${pendingProductTitle || 'Product'} added to cart`);
        dispatch(fetchMyCart());
        setPendingProductId(null);
        setPendingProductTitle('');
      } catch (error: any) {
        message.error(error?.message || 'Failed to add product to cart');
      }
    }
  };

  // Filter flash sale products (products with "flash-sale" tag or category)
  const flashSaleProducts = allProducts.filter((product: any) => {
    const tags = product.tag || [];
    const categories = product.categories || [];
    return tags.includes('flash-sale') || 
           tags.includes('flash_sale') ||
           tags.includes('Flash Sale') ||
           categories.includes('flash-sale') ||
           categories.includes('flash_sale');
  }).slice(0, 6); // Only show first 6 products

  const productsToShow = selectedCategory
    ? categoryProducts[selectedCategory] || []
    : allProducts;

  // For categories section, limit initial display to 12 items
  const displayedProducts = selectedCategory
    ? productsToShow.slice(0, displayedProductsCount)
    : productsToShow.slice(0, displayedProductsCount);
  
  const hasMoreProducts = productsToShow.length > displayedProductsCount;

  const handleLoadMore = () => {
    setDisplayedProductsCount(prev => prev + 12);
  };

  // Role-specific homepage content
  const getRoleSpecificContent = () => {
    switch (userRole) {
      case 'delivery_agency':
        return {
          title: 'Delivery Agency Dashboard',
          description: 'Welcome to your delivery management console. Manage customer deliveries and returns efficiently.',
          features: [
            'Manage customer delivery assignments',
            'Manage return delivery assignments',
            'Assign warehouse operators and delivery personnel',
            'Track delivery status in real-time',
          ],
          dashboardLink: '/user/delivery-agency',
          icon: <CarOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
        };
      case 'delivery_person':
        const delivererType = result?.delivererType;
        if (delivererType === 'customer_return') {
          return {
            title: 'Return Deliverer Dashboard',
            description: 'Welcome to your return delivery management console. Handle return pickups and re-deliveries.',
            features: [
              'View assigned return deliveries',
              'Pick up returns from customers',
              'Submit returns to support',
              'Re-deliver rejected returns',
            ],
            dashboardLink: '/user/return-deliverer',
            icon: <CarOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
          };
        }
        return {
          title: 'Delivery Person Dashboard',
          description: 'Welcome to your delivery management console. Manage your assigned deliveries efficiently.',
          features: [
            'View assigned deliveries',
            'Update delivery status',
            'Mark deliveries as completed',
            'Handle delivery acceptance/rejection',
          ],
          dashboardLink: '/user/delivery-person',
          icon: <CarOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
        };
      case 'warehouse_operator':
        return {
          title: 'Warehouse Operator Dashboard',
          description: 'Welcome to your warehouse management console. Coordinate orders within the delivery facility.',
          features: [
            'View orders in facility',
            'Assign customer delivery deliverers',
            'Update delivery status',
            'Track order processing',
          ],
          dashboardLink: '/user/warehouse-operator',
          icon: <CheckCircleOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
        };
      case 'support':
      case 'support_user':
        return {
          title: 'Support Team Dashboard',
          description: 'Welcome to your support management console. Manage return requests and coordinate the return workflow.',
          features: [
            'View and assign return requests',
            'Assign delivery agencies',
            'Assign verification teams',
            'Coordinate return workflow',
          ],
          dashboardLink: '/user/support',
          icon: <TeamOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
        };
      case 'verification_team':
        return {
          title: 'Verification Team Dashboard',
          description: 'Welcome to your verification management console. Manage return inspections and assign inspectors.',
          features: [
            'View returns in inspection queue',
            'Assign return inspectors',
            'Track inspection status',
            'Coordinate inspection workflow',
          ],
          dashboardLink: '/user/verification',
          icon: <SafetyOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
        };
      case 'return_inspector':
        return {
          title: 'Inspector Dashboard',
          description: 'Welcome to your inspection console. Inspect return packages and make accept/reject decisions.',
          features: [
            'View assigned return inspections',
            'Inspect return packages',
            'Accept or reject returns',
            'Document inspection findings',
          ],
          dashboardLink: '/user/inspector',
          icon: <SafetyOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
        };
      case 'finance':
        return {
          title: 'Finance Dashboard',
          description: 'Welcome to your finance management console. Process refunds securely and manage financial transactions.',
          features: [
            'View returns pending refund',
            'Process refunds via Stripe',
            'Track refund status',
            'View refund history',
          ],
          dashboardLink: '/user/finance',
          icon: <BankOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
        };
      case 'admin':
        return {
          title: 'Admin Dashboard',
          description: 'Welcome to your administration console. Manage the platform, users, and system operations.',
          features: [
            'Create and manage delivery agencies',
            'Create and manage support admins',
            'Create and manage finance users',
            'Reset passwords for child users',
          ],
          dashboardLink: '/user/admin',
          icon: <UserOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
        };
      default:
        return null;
    }
  };

  const roleContent = getRoleSpecificContent();

  // Show role-specific content for non-buyers/sellers
  if (isDeliveryUser && roleContent) {
    return (
      <>
        {title}
        <Container className={styles.pageContainer}>
          <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
            <Card>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>{roleContent.icon}</div>
                <Title level={1}>{roleContent.title}</Title>
                <Paragraph style={{ fontSize: '16px' }}>{roleContent.description}</Paragraph>
                
                <List
                  dataSource={roleContent.features}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>• {item}</Text>
                    </List.Item>
                  )}
                  style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}
                />

                <Button
                  type="primary"
                  size="large"
                  icon={<DashboardOutlined />}
                  onClick={() => navigate(roleContent.dashboardLink)}
                  style={{ marginTop: '20px' }}
                >
                  Go to Dashboard
                </Button>
              </Space>
            </Card>
          </Space>
        </Container>
      </>
    );
  }

  // Show products for buyers, sellers, and unauthenticated users
  return (
    <>
      {title}
      {/* Hero Banner Swiper - Full width, right after header - Show for public users and logged in buyers/sellers */}
      {canSeeHeroBanner(userRole) && <HeroBanner />}
      
      <Container className={styles.pageContainer}>
        <div className="homepage">
          {/* Flash Sale Section */}
          {flashSaleProducts.length > 0 && (
            <div className="flash-sale-section">
              <div className="flash-sale-header">
                <h2>🔥 Flash Sale</h2>
                <Button
                  type="link"
                  className="shop-all-link"
                  onClick={() => navigate('/products?tag=flash-sale')}
                >
                  Shop All Products →
                </Button>
              </div>
              <div className="flash-sale-products">
                {flashSaleProducts.map((item: any) => (
                  <Card
                    key={item._id}
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
                        {(item.stock || 0) <= 0 ? (
                          !isSeller && result ? (
                            <WishlistButton
                              productId={item._id}
                              productTitle={item.title}
                              size="small"
                            />
                          ) : null
                        ) : (
                          !isSeller && result ? (
                            <Button
                              type="primary"
                              size="small"
                              onClick={(e) => handleAddToCart(item._id, item.stock || 0, item.title, e)}
                            >
                              Add to Cart
                            </Button>
                          ) : !result ? (
                            <Button
                              type="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingProductId(item._id);
                                setPendingProductTitle(item.title);
                                setAuthModalVisible(true);
                              }}
                            >
                              Add to Cart
                            </Button>
                          ) : null
                        )}
                      </div>,
                    ]}
                    hoverable
                  >
                    <Card.Meta
                      title={item.title}
                      description={
                        <div className="product-meta">
                          {item.body?.summary || item.description || LABELS.COMMON.NO_DESCRIPTION}
                          {item.price && (
                            <div className="product-price">${item.price.toFixed(2)}</div>
                          )}
                          <div className="product-stock">
                            {item.stock !== undefined ? (
                              <span className={item.stock > 0 ? 'stock-available' : 'stock-out'}>
                                {item.stock > 0 ? `${LABELS.COMMON.IN_STOCK} (${item.stock})` : LABELS.COMMON.OUT_OF_STOCK}
                              </span>
                            ) : (
                              <span className="stock-unknown">{LABELS.COMMON.STOCK_UNAVAILABLE}</span>
                            )}
                          </div>
                        </div>
                      }
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Categories Section */}
          <div className="categories-section">
            <h1>Shop by Category</h1>
            
            {categories.length > 0 && (
              <Tabs
                activeKey={selectedCategory || 'All'}
                onChange={(key) => {
                  setSelectedCategory(key === 'All' ? null : key);
                  setDisplayedProductsCount(12); // Reset to 12 when changing category
                }}
                className="category-tabs"
                items={[
                  { key: 'All', label: LABELS.COMMON.ALL_PRODUCTS },
                  ...categories.map((cat) => ({
                    key: cat,
                    label: cat.charAt(0).toUpperCase() + cat.slice(1),
                  })),
                ]}
              />
            )}

            <Spin spinning={status.loading}>
              {displayedProducts.length === 0 ? (
                <Card>
                  <div className="text-center py-8">
                    <p>No products found in this category.</p>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="products-grid">
                    {displayedProducts.map((item: any) => (
                      <Card
                        key={item._id}
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
                            {(item.stock || 0) <= 0 ? (
                              !isSeller && result ? (
                                <WishlistButton
                                  productId={item._id}
                                  productTitle={item.title}
                                  size="small"
                                />
                              ) : null
                            ) : (
                              !isSeller && result ? (
                                <Button
                                  type="primary"
                                  size="small"
                                  onClick={(e) => handleAddToCart(item._id, item.stock || 0, item.title, e)}
                                >
                                  Add to Cart
                                </Button>
                              ) : !result ? (
                                <Button
                                  type="primary"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPendingProductId(item._id);
                                    setPendingProductTitle(item.title);
                                    setAuthModalVisible(true);
                                  }}
                                >
                                  Add to Cart
                                </Button>
                              ) : null
                            )}
                          </div>,
                        ]}
                        hoverable
                      >
                        <Card.Meta
                          title={item.title}
                          description={
                            <div className="product-meta">
                              {item.body?.summary || item.description || LABELS.COMMON.NO_DESCRIPTION}
                              {item.price && (
                                <div className="product-price">${item.price.toFixed(2)}</div>
                              )}
                              <div className="product-stock">
                                {item.stock !== undefined ? (
                                  <span className={item.stock > 0 ? 'stock-available' : 'stock-out'}>
                                    {item.stock > 0 ? `${LABELS.COMMON.IN_STOCK} (${item.stock})` : LABELS.COMMON.OUT_OF_STOCK}
                                  </span>
                                ) : (
                                  <span className="stock-unknown">{LABELS.COMMON.STOCK_UNAVAILABLE}</span>
                                )}
                              </div>
                            </div>
                          }
                        />
                      </Card>
                    ))}
                  </div>
                  {hasMoreProducts && (
                    <div className="load-more-container">
                      <Button type="primary" size="large" onClick={handleLoadMore}>
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Spin>
          </div>
        </div>
      </Container>
      <AuthModal
        open={authModalVisible}
        onClose={() => {
          setAuthModalVisible(false);
          setPendingProductId(null);
          setPendingProductTitle('');
        }}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export { HomePage };
