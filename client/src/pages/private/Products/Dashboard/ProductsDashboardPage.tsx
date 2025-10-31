import React, { useEffect, useState } from 'react';
import { Button, Card, List, message, Modal, Tabs, Tag, Statistic, Row, Col, Space, Image, Popconfirm, Spin, Empty, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { fetchMyProductsApi, deleteProductApi } from 'services/endPoints/products/productsEndpoints';
import { getSellerOrdersApi } from 'services/endPoints/orders/ordersEndpoints';
import { getDeliveryTrackingApi } from 'services/endPoints/delivery';
import { getSellerReturnsApi, approveReturnApi, rejectReturnApi } from 'services/endPoints/return';
import { DeliveryTracking, RefundStatus } from 'components';
import { getSellerCartItemsApi } from 'services/endPoints/carts/cartsEndpoints';
import { getUserStatsApi } from 'services/endPoints/user/userEndpoints';
import { getSellerWishlistApi } from 'services/endPoints/wishlist';
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
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [returnsLoading, setReturnsLoading] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [deliveryTracking, setDeliveryTracking] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [trackingModalVisible, setTrackingModalVisible] = useState(false);
  const [returns, setReturns] = useState<any[]>([]);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectingReturnId, setRejectingReturnId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else if (activeTab === 'carts') {
      loadCartItems();
    } else if (activeTab === 'wishlist') {
      loadWishlist();
    } else if (activeTab === 'returns') {
      loadReturns();
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

  const loadWishlist = async () => {
    const token = getToken();
    if (!token) return;
    try {
      setWishlistLoading(true);
      const { data } = await getSellerWishlistApi();
      setWishlistItems(data.wishlist || []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setWishlistLoading(false);
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

  const loadReturns = async () => {
    setReturnsLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const { data } = await getSellerReturnsApi();
      setReturns(data.returns || []);
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Failed to load returns');
    } finally {
      setReturnsLoading(false);
    }
  };

  const handleApproveReturn = async (returnId: string) => {
    try {
      await approveReturnApi(returnId);
      message.success('Return approved and refund processed');
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to approve return');
    }
  };

  const handleRejectReturn = async () => {
    if (!rejectingReturnId) return;
    try {
      await rejectReturnApi(rejectingReturnId, rejectReason);
      message.success('Return rejected');
      setRejectModalVisible(false);
      setRejectReason('');
      setRejectingReturnId(null);
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to reject return');
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
                        <div className="mb-2">
                          <Tag color={getStatusColor(order.status)}>
                            {order.status?.toUpperCase()}
                          </Tag>
                          {order.deliveryStatus && (
                            <Tag color="blue" style={{ marginLeft: 8 }}>
                              {order.deliveryStatus.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Tag>
                          )}
                          {order.refundStatus && (
                            <Tag 
                              color={order.refundStatus === 'succeeded' ? 'success' : order.refundStatus === 'failed' ? 'error' : 'warning'} 
                              style={{ marginLeft: 8 }}
                            >
                              Refund: {order.refundStatus.replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Tag>
                          )}
                        </div>
                        <div className="font-semibold text-lg mt-2">
                          ${(order.amount / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="font-semibold mb-2">Items:</div>
                      {order.items?.map((item: any, idx: number) => {
                        const itemDeliveryTracking = item.deliveryTracking;
                        const itemStatus = item.deliveryStatus || itemDeliveryTracking?.status;
                        
                        return (
                          <div key={idx} className="flex items-start gap-4 mb-3 pb-3 border-b last:border-b-0">
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
                              {itemDeliveryTracking && (
                                <div className="mt-2">
                                  <Tag color="blue" style={{ marginTop: 4 }}>
                                    Delivery: {itemDeliveryTracking.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || itemStatus?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Packing'}
                                  </Tag>
                                  {itemDeliveryTracking.buyerAcceptance === 'accepted' && (
                                    <Tag color="success" style={{ marginLeft: 4 }}>Buyer Accepted</Tag>
                                  )}
                                  {itemDeliveryTracking.buyerAcceptance === 'rejected' && (
                                    <Tag color="error" style={{ marginLeft: 4 }}>Buyer Rejected</Tag>
                                  )}
                                  {itemDeliveryTracking.buyerAcceptance === 'pending' && itemStatus === 'delivered' && (
                                    <Tag color="warning" style={{ marginLeft: 4 }}>Pending Buyer Acceptance</Tag>
                                  )}
                                  {item.returnStatus && (
                                    <Tag color="orange" style={{ marginLeft: 4 }}>
                                      Return: {item.returnStatus.replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                    </Tag>
                                  )}
                                  {item.refundStatus && (
                                    <Tag 
                                      color={item.refundStatus === 'succeeded' ? 'success' : item.refundStatus === 'failed' ? 'error' : 'warning'}
                                      style={{ marginLeft: 4 }}
                                    >
                                      Refund: {item.refundStatus.replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                    </Tag>
                                  )}
                                </div>
                              )}
                            </div>
                            <Space direction="vertical" size="small">
                              <Button
                                type="link"
                                size="small"
                                onClick={() => navigate(`/products/${item.productId}`)}
                              >
                                View Product
                              </Button>
                              {itemDeliveryTracking && (
                                <Button
                                  type="default"
                                  size="small"
                                  onClick={async () => {
                                    try {
                                      const { data } = await getDeliveryTrackingApi(order._id);
                                      // Find delivery for this specific item
                                      const itemDelivery = data.deliveries?.find(
                                        (d: any) => String(d.orderItemId) === String(item._id) || 
                                                   String(d.productId) === String(item.productId)
                                      ) || data.delivery;
                                      if (itemDelivery) {
                                        setDeliveryTracking(itemDelivery);
                                        setDeliveries([itemDelivery]);
                                      } else {
                                        // Fallback: create a delivery object from item data
                                        setDeliveryTracking({
                                          orderId: order._id,
                                          orderItemId: item._id,
                                          productId: item.productId,
                                          status: itemStatus || 'packing',
                                          ...itemDeliveryTracking,
                                        });
                                        setDeliveries([{
                                          orderId: order._id,
                                          orderItemId: item._id,
                                          productId: item.productId,
                                          status: itemStatus || 'packing',
                                          ...itemDeliveryTracking,
                                        }]);
                                      }
                                      setSelectedOrder(order);
                                      setTrackingModalVisible(true);
                                    } catch (error: any) {
                                      message.error(error?.response?.data?.message || 'Failed to load delivery tracking');
                                    }
                                  }}
                                >
                                  Track Item
                                </Button>
                              )}
                            </Space>
                          </div>
                        );
                      })}
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

          <TabPane tab="Returns" key="returns">
            <List
              loading={returnsLoading}
              dataSource={returns}
              renderItem={(returnRequest: any) => (
                <List.Item>
                  <Card className="w-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-semibold">Return #{returnRequest._id.slice(-8)}</div>
                        <div className="text-sm text-gray-500">
                          Buyer: {returnRequest.userId?.fullName || 'Unknown'} ({returnRequest.userId?.email || 'N/A'})
                        </div>
                        <div className="text-sm text-gray-500">
                          {dayjs(returnRequest.createdAt).format('MMM DD, YYYY HH:mm')}
                        </div>
                        {returnRequest.reason && (
                          <div className="text-sm text-gray-600 mt-2">
                            <strong>Reason:</strong> {returnRequest.reason}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="mb-2">
                          <Tag color={
                            returnRequest.returnStatus === 'pending' ? 'warning' :
                            returnRequest.returnStatus === 'approved' ? 'processing' :
                            returnRequest.returnStatus === 'refunded' || returnRequest.returnStatus === 'completed' ? 'success' :
                            returnRequest.returnStatus === 'rejected' ? 'error' :
                            'default'
                          }>
                            {returnRequest.returnStatus?.toUpperCase()}
                          </Tag>
                          {returnRequest.refundStatus && (
                            <Tag 
                              color={returnRequest.refundStatus === 'succeeded' ? 'success' : returnRequest.refundStatus === 'failed' ? 'error' : 'warning'} 
                              style={{ marginLeft: 8 }}
                            >
                              Refund: {returnRequest.refundStatus.replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </Tag>
                          )}
                        </div>
                        <div className="font-semibold text-lg mt-2">
                          ${((returnRequest.returnAmount || 0) / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="font-semibold mb-2">Return Items:</div>
                      {returnRequest.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 mb-2 pb-2 border-b last:border-b-0">
                          <div className="flex-1">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-gray-500">
                              Quantity: {item.quantity} × ${item.price} = ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            {item.reason && (
                              <div className="text-sm text-gray-500 mt-1">
                                Reason: {item.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <Space>
                        {returnRequest.returnStatus === 'pending' && (
                          <>
                            <Button
                              type="primary"
                              onClick={() => handleApproveReturn(returnRequest._id)}
                            >
                              Approve Return
                            </Button>
                            <Button
                              type="default"
                              danger
                              onClick={() => {
                                setRejectingReturnId(returnRequest._id);
                                setRejectModalVisible(true);
                              }}
                            >
                              Reject Return
                            </Button>
                          </>
                        )}
                        {(returnRequest.returnStatus === 'refunded' || returnRequest.refundStatus) && (
                          <Button
                            type="default"
                            onClick={async () => {
                              try {
                                const { data } = await getDeliveryTrackingApi(returnRequest.orderId?._id || returnRequest.orderId);
                                setDeliveryTracking(data.delivery);
                                setSelectedOrder(returnRequest.orderId);
                                setTrackingModalVisible(true);
                              } catch (error: any) {
                                message.error('Failed to load order details');
                              }
                            }}
                          >
                            View Refund Status
                          </Button>
                        )}
                      </Space>
                    </div>
                    {returnRequest.rejectionReason && (
                      <div className="border-t pt-4 mt-4 text-red-600">
                        <strong>Rejection Reason:</strong> {returnRequest.rejectionReason}
                      </div>
                    )}
                  </Card>
                </List.Item>
              )}
            />
            {returns.length === 0 && !returnsLoading && (
              <div className="text-center py-8">
                <p>No return requests yet. Return requests for your products will appear here.</p>
              </div>
            )}
          </TabPane>

          <TabPane tab="Wishlist" key="wishlist">
            <Card>
              <h3 className="mb-4">Products Added to Wishlist</h3>
              {wishlistLoading ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                </div>
              ) : wishlistItems.length === 0 ? (
                <Empty description="No one has added your products to their wishlist yet" />
              ) : (
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 4, xl: 4, xxl: 4 }}
                  dataSource={wishlistItems}
                  renderItem={(item: any) => {
                    const product = item.productId;
                    const user = item.userId;
                    const productId = typeof product === 'object' ? product._id : product;
                    const productTitle = typeof product === 'object' ? product.title : 'Product';
                    const productThumbnail = typeof product === 'object' ? product.thumbnail : null;
                    const productPrice = typeof product === 'object' ? product.price : null;
                    const userName = typeof user === 'object' ? user.fullName : 'Unknown User';
                    const userEmail = typeof user === 'object' ? user.email : '';
                    const userPhoto = typeof user === 'object' ? user.profilePhoto : null;

                    return (
                      <List.Item>
                        <Card
                          className="wishlist-product-card"
                          cover={
                            productThumbnail ? (
                              <Image
                                src={productThumbnail}
                                alt={productTitle}
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
                            <Link key="view" to={`/products/${productId}`}>
                              <EyeOutlined /> View Product
                            </Link>,
                          ]}
                        >
                          <Card.Meta
                            title={
                              <div>
                                <div style={{ marginBottom: 8 }}>{productTitle}</div>
                                {productPrice && (
                                  <div style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
                                    ${productPrice.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            }
                            description={
                              <div>
                                <div style={{ marginTop: 12, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                                  <div style={{ fontWeight: 600, marginBottom: 4 }}>Added by:</div>
                                  <Space>
                                    {userPhoto && (
                                      <Image
                                        src={userPhoto}
                                        alt={userName}
                                        width={32}
                                        height={32}
                                        style={{ borderRadius: '50%' }}
                                        preview={false}
                                      />
                                    )}
                                    <div>
                                      <div>{userName}</div>
                                      {userEmail && <div style={{ fontSize: 12, color: '#666' }}>{userEmail}</div>}
                                    </div>
                                  </Space>
                                </div>
                                <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                                  Added {dayjs(item.createdAt).format('MMM DD, YYYY')}
                                </div>
                              </div>
                            }
                          />
                        </Card>
                      </List.Item>
                    );
                  }}
                />
              )}
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

        <Modal
          title="Delivery Tracking"
          open={trackingModalVisible}
          onCancel={() => {
            setTrackingModalVisible(false);
            setDeliveryTracking(null);
            setDeliveries([]);
            setSelectedOrder(null);
          }}
          footer={[
            <Button key="close" onClick={() => {
              setTrackingModalVisible(false);
              setDeliveryTracking(null);
              setDeliveries([]);
              setSelectedOrder(null);
            }}>
              Close
            </Button>,
          ]}
          width={900}
        >
          {selectedOrder && deliveryTracking && (
            <div>
              {(() => {
                const orderItem = selectedOrder.items?.find(
                  (item: any) => String(item._id) === String(deliveryTracking.orderItemId) || 
                                String(item.productId) === String(deliveryTracking.productId)
                );
                return (
                  <div>
                    {orderItem && (
                      <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>Product:</div>
                        <div>{orderItem.title}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                          ${orderItem.price} × {orderItem.quantity}
                        </div>
                      </div>
                    )}
                    <DeliveryTracking 
                      delivery={deliveryTracking} 
                      order={selectedOrder}
                      isSeller={true}
                      orderItemId={deliveryTracking.orderItemId}
                      productId={deliveryTracking.productId}
                      onStatusUpdate={async () => {
                        // Reload delivery tracking after update
                        try {
                          const { data } = await getDeliveryTrackingApi(selectedOrder._id);
                          const itemDelivery = data.deliveries?.find(
                            (d: any) => String(d.orderItemId) === String(deliveryTracking.orderItemId) || 
                                       String(d.productId) === String(deliveryTracking.productId)
                          ) || data.delivery;
                          if (itemDelivery) {
                            setDeliveryTracking(itemDelivery);
                            setDeliveries([itemDelivery]);
                          }
                          // Also reload orders to refresh status
                          loadOrders();
                        } catch (error: any) {
                          console.error('Failed to reload delivery tracking:', error);
                        }
                      }}
                    />
                  </div>
                );
              })()}
            </div>
          )}
        </Modal>

        <Modal
          title="Reject Return Request"
          open={rejectModalVisible}
          onOk={handleRejectReturn}
          onCancel={() => {
            setRejectModalVisible(false);
            setRejectReason('');
            setRejectingReturnId(null);
          }}
          okText="Confirm Rejection"
          okButtonProps={{ danger: true }}
        >
          <Input.TextArea
            placeholder="Please provide a reason for rejecting this return request"
            value={rejectReason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
            rows={4}
          />
        </Modal>
      </Container>
    </>
  );
};

export { ProductsDashboardPage };
