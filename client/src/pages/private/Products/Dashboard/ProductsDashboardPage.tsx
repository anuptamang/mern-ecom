import React, { useEffect, useState } from 'react';
import { Button, Card, List, message, Modal, Tabs, Tag, Statistic, Row, Col, Space, Image, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { fetchMyProductsApi, deleteProductApi } from 'services/endPoints/products/productsEndpoints';
import { getSellerOrdersApi } from 'services/endPoints/orders/ordersEndpoints';
import { getSellerCartItemsApi } from 'services/endPoints/carts/cartsEndpoints';
import { getUserStatsApi } from 'services/endPoints/user/userEndpoints';
import { ProductForm } from 'components';
import { getToken } from 'utils/localStorage';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from 'hooks/usePageTitle';
import { Container } from 'components/UI';
import dayjs from 'dayjs';
import './ProductsDashboardPage.scss';

const { TabPane } = Tabs;

type Props = {};

const ProductsDashboardPage = (props: Props) => {
  const title = usePageTitle();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    loadProducts();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'carts') {
      loadCartItems();
    }
  }, [activeTab]);

  const loadProducts = async () => {
    const token = getToken();
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetchMyProductsApi();
      // Handle both response.data.data and response.data formats
      const productsData = response.data?.data || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
      
      if (productsData.length === 0) {
        console.log('No products found for user');
      }
    } catch (e: any) {
      console.error('Error loading products:', e);
      message.error(e?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    const token = getToken();
    if (!token) return;
    try {
      setOrderLoading(true);
      const { data } = await getSellerOrdersApi(token);
      setOrders(data.orders || []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load orders');
    } finally {
      setOrderLoading(false);
    }
  };

  const loadCartItems = async () => {
    const token = getToken();
    if (!token) return;
    try {
      setCartLoading(true);
      const { data } = await getSellerCartItemsApi(token);
      setCartItems(data.cartItems || []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load cart items');
    } finally {
      setCartLoading(false);
    }
  };

  const loadStats = async () => {
    const token = getToken();
    if (!token) return;
    try {
      setStatsLoading(true);
      const { data } = await getUserStatsApi(token);
      setStats(data || {});
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductModalVisible(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductModalVisible(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductApi(productId);
      message.success('Product deleted successfully');
      loadProducts();
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleProductFormSuccess = () => {
    setProductModalVisible(false);
    setEditingProduct(null);
    loadProducts();
    loadStats(); // Refresh stats
  };

  const handleProductFormCancel = () => {
    setProductModalVisible(false);
    setEditingProduct(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'created':
        return 'orange';
      case 'failed':
        return 'red';
      default:
        return 'default';
    }
  };

  return (
    <>
      {title}
      <Container className="py-6 products-dashboard">
        <div className="mb-6 flex justify-between items-center">
          <h2>My Store</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="My Products" key="products">
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
              loading={loading}
              dataSource={products}
              renderItem={(item: any) => (
                <List.Item>
                  <Card
                    cover={
                      item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          height={200}
                          style={{ objectFit: 'cover' }}
                          preview={false}
                        />
                      ) : (
                        <div style={{ height: 200, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          No Image
                        </div>
                      )
                    }
                    actions={[
                      <Link key="view" to={`/products/${item._id}`}>
                        <EyeOutlined /> View
                      </Link>,
                      <Button
                        key="edit"
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditProduct(item)}
                      >
                        Edit
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="Are you sure you want to delete this product?"
                        onConfirm={() => handleDeleteProduct(item._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                        >
                          Delete
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <Card.Meta
                      title={item.title}
                      description={
                        <div>
                          <div>${item.price || 0}</div>
                          <div>Stock: {item.stock || 0}</div>
                          {item.categories && item.categories.length > 0 && (
                            <div className="mt-2">
                              {item.categories.slice(0, 2).map((cat: string) => (
                                <Tag key={cat}>{cat}</Tag>
                              ))}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
            {products.length === 0 && !loading && (
              <div className="text-center py-8">
                <p>No products yet. Click "Add Product" to create your first product.</p>
              </div>
            )}
          </TabPane>

          <TabPane tab="Orders" key="orders">
            <List
              loading={orderLoading}
              dataSource={orders}
              renderItem={(order: any) => (
                <List.Item>
                  <Card className="w-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-semibold">Order #{order._id.slice(-8)}</div>
                        <div className="text-sm text-gray-500">
                          {order.userId?.fullName || 'Unknown Buyer'} ({order.userId?.email || 'N/A'})
                        </div>
                        <div className="text-sm text-gray-500">
                          {dayjs(order.createdAt).format('MMM DD, YYYY HH:mm')}
                        </div>
                      </div>
                      <div className="text-right">
                        <Tag color={getStatusColor(order.status)}>
                          {order.status?.toUpperCase()}
                        </Tag>
                        <div className="font-semibold text-lg mt-2">
                          ${(order.amount / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="font-semibold mb-2">Items:</div>
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 mb-2 pb-2 border-b last:border-b-0">
                          {item.thumbnail && (
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              width={60}
                              height={60}
                              style={{ objectFit: 'cover' }}
                              preview={false}
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-gray-500">
                              ${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            type="link"
                            onClick={() => navigate(`/products/${item.productId}`)}
                          >
                            View Product
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </List.Item>
              )}
            />
            {orders.length === 0 && !orderLoading && (
              <div className="text-center py-8">
                <p>No orders yet. Orders containing your products will appear here.</p>
              </div>
            )}
          </TabPane>

          <TabPane tab="Cart Items" key="carts">
            <List
              loading={cartLoading}
              dataSource={cartItems}
              renderItem={(item: any) => (
                <List.Item>
                  <Card className="w-full">
                    <div className="flex items-center gap-4">
                      {item.thumbnail && (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={80}
                          height={80}
                          style={{ objectFit: 'cover' }}
                          preview={false}
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-gray-500">
                          Buyer: {item.buyerName} ({item.buyerEmail})
                        </div>
                        <div className="text-sm">
                          ${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                      <Button
                        type="link"
                        onClick={() => navigate(`/products/${item.productId}`)}
                      >
                        View Product
                      </Button>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
            {cartItems.length === 0 && !cartLoading && (
              <div className="text-center py-8">
                <p>No cart items yet. Items from your products in buyer carts will appear here.</p>
              </div>
            )}
          </TabPane>

          <TabPane tab="Sales Stats" key="stats">
            <Row gutter={16} className="mb-6">
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Products"
                    value={stats.totalProducts || 0}
                    loading={statsLoading}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Sales"
                    value={stats.totalSales || 0}
                    loading={statsLoading}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Revenue"
                    value={stats.totalRevenue || 0}
                    precision={2}
                    prefix="$"
                    loading={statsLoading}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Items in Carts"
                    value={stats.cartItemsCount || 0}
                    loading={statsLoading}
                  />
                </Card>
              </Col>
            </Row>
            <Card>
              <h3 className="mb-4">Summary</h3>
              <div className="space-y-2">
                <p>
                  You have <strong>{stats.totalProducts || 0}</strong> products listed.
                </p>
                <p>
                  Your products have been purchased <strong>{stats.totalSales || 0}</strong> times,
                  generating <strong>${(stats.totalRevenue || 0).toFixed(2)}</strong> in revenue.
                </p>
                <p>
                  Currently, <strong>{stats.cartItemsCount || 0}</strong> of your products are in
                  buyers' shopping carts.
                </p>
              </div>
            </Card>
          </TabPane>
        </Tabs>

        <Modal
          title={editingProduct ? 'Edit Product' : 'Add New Product'}
          open={productModalVisible}
          onCancel={handleProductFormCancel}
          footer={null}
          width={800}
          destroyOnClose
        >
          <ProductForm
            product={editingProduct}
            onSuccess={handleProductFormSuccess}
            onCancel={handleProductFormCancel}
          />
        </Modal>
      </Container>
    </>
  );
};

export { ProductsDashboardPage };
