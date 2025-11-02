import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, message, Empty, Spin, Typography, Space, Modal, Image, Tabs, Descriptions, Alert, Input } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, EyeOutlined, DollarOutlined, BankOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from 'hooks';
import { useSearchParams } from 'react-router-dom';
import {
  getReturnRequestApi,
} from 'services/endPoints/return';
import {
  getFinanceReturnsApi,
  processRefundApi,
} from 'services/endPoints/return/returnWorkflowEndpoints';
import {
  getPendingPayoutsApi,
  getPayoutsApi,
  getPayoutApi,
  processPayoutApi,
  cancelPayoutApi,
  IPayout,
} from 'services/endPoints/payout/payoutEndpoints';
import './FinanceDashboard.scss';

const { Text, Title } = Typography;

interface IReturn {
  _id: string;
  orderId: { _id: string; items: any[]; paymentIntentId?: string };
  userId: { fullName: string; email: string };
  items: any[];
  returnAmount: number;
  reason: string;
  proofImages?: string[];
  returnStatus: string;
  assignedFinance?: any;
  assignedSupportUser?: any;
  refundStatus?: string;
  refundId?: string;
  inspectionResult?: 'accepted' | 'rejected';
  inspectionNote?: string;
}


const FinanceDashboard = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [returns, setReturns] = useState<IReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<IReturn | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Payout states
  const [payouts, setPayouts] = useState<IPayout[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<IPayout | null>(null);
  const [payoutDetailModalVisible, setPayoutDetailModalVisible] = useState(false);
  const [processingPayout, setProcessingPayout] = useState(false);
  const [payoutNotes, setPayoutNotes] = useState('');
  const [activeTab, setActiveTab] = useState('returns');

  useEffect(() => {
    loadReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle URL params for notification navigation
  useEffect(() => {
    const returnId = searchParams.get('returnId');
    const payoutId = searchParams.get('payoutId');
    
    if (returnId) {
      setActiveTab('returns');
      loadReturnById(returnId);
    } else if (payoutId) {
      setActiveTab('payouts');
      loadPayoutById(payoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const { data } = await getFinanceReturnsApi();
      setReturns(data.returns || []);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const loadReturnById = async (returnId: string) => {
    try {
      const { data } = await getReturnRequestApi(returnId);
      if (data.returnRequest) {
        setSelectedReturn(data.returnRequest);
        setDetailModalVisible(true);
        // Add to returns list if not already there
        setReturns(prev => {
          if (!prev.find(r => String(r._id) === returnId)) {
            return [data.returnRequest, ...prev];
          }
          return prev;
        });
      }
    } catch (error: any) {
      console.error('Failed to load return details:', error);
      message.error(error?.response?.data?.message || 'Failed to load return details');
    }
  };

  const handleViewDetails = async (returnRequest: IReturn) => {
    try {
      setSelectedReturn(returnRequest);
      setDetailModalVisible(true);
      const { data } = await getReturnRequestApi(returnRequest._id);
      if (data.returnRequest) {
        setSelectedReturn(data.returnRequest);
      }
    } catch (error: any) {
      message.error('Failed to load return details');
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedReturn) return;

    try {
      setProcessing(true);
      await processRefundApi(selectedReturn._id);
      message.success('Refund processed successfully');
      setDetailModalVisible(false);
      setSelectedReturn(null);
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  // Payout functions
  const loadPayouts = async () => {
    try {
      setLoadingPayouts(true);
      const response = await getPendingPayoutsApi();
      setPayouts(response.payouts || []);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load payouts');
    } finally {
      setLoadingPayouts(false);
    }
  };

  const loadPayoutById = async (payoutId: string) => {
    try {
      const response = await getPayoutApi(payoutId);
      if (response.payout) {
        setSelectedPayout(response.payout);
        setPayoutDetailModalVisible(true);
        // Add to payouts list if not already there
        setPayouts(prev => {
          if (!prev.find(p => String(p._id) === payoutId)) {
            return [response.payout, ...prev];
          }
          return prev;
        });
      }
    } catch (error: any) {
      console.error('Failed to load payout details:', error);
      message.error(error?.response?.data?.message || 'Failed to load payout details');
    }
  };

  const handleViewPayoutDetails = async (payout: IPayout) => {
    try {
      setSelectedPayout(payout);
      setPayoutDetailModalVisible(true);
      const response = await getPayoutApi(payout._id);
      if (response.payout) {
        setSelectedPayout(response.payout);
      }
    } catch (error: any) {
      message.error('Failed to load payout details');
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout) return;

    try {
      setProcessingPayout(true);
      await processPayoutApi(selectedPayout._id, payoutNotes || undefined);
      message.success('Payout processed successfully');
      setPayoutDetailModalVisible(false);
      setSelectedPayout(null);
      setPayoutNotes('');
      loadPayouts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to process payout');
    } finally {
      setProcessingPayout(false);
    }
  };

  const handleCancelPayout = async () => {
    if (!selectedPayout) return;

    try {
      setProcessingPayout(true);
      await cancelPayoutApi(selectedPayout._id, payoutNotes || undefined);
      message.success('Payout cancelled successfully');
      setPayoutDetailModalVisible(false);
      setSelectedPayout(null);
      setPayoutNotes('');
      loadPayouts();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to cancel payout');
    } finally {
      setProcessingPayout(false);
    }
  };

  // Load payouts when tab changes to payouts
  useEffect(() => {
    if (activeTab === 'payouts') {
      loadPayouts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const getStatusTag = (status: string, refundStatus?: string) => {
    const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
      refund_processing: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Processing Refund',
      },
      refunded: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Refunded',
      },
    };

    // If refund status is succeeded, show refunded
    if (refundStatus === 'succeeded' || status === 'refunded') {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          Refunded
        </Tag>
      );
    }

    // Show status based on returnStatus
    const config = statusConfig[status] || {
      color: 'processing',
      icon: <ClockCircleOutlined />,
      text: status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    };

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const getPayoutStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
      pending: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Pending',
      },
      processing: {
        color: 'warning',
        icon: <ClockCircleOutlined />,
        text: 'Processing',
      },
      completed: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Completed',
      },
      failed: {
        color: 'error',
        icon: <WarningOutlined />,
        text: 'Failed',
      },
      cancelled: {
        color: 'default',
        icon: <WarningOutlined />,
        text: 'Cancelled',
      },
    };

    const config = statusConfig[status] || {
      color: 'default',
      icon: null,
      text: status,
    };

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  return (
    <div className="finance-dashboard">
      <Card>
        <Title level={2}>Finance Team Dashboard</Title>
        <Text type="secondary">
          Process refunds for accepted return requests and payouts to sellers for delivered items.
        </Text>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          {
            key: 'returns',
            label: <span><DollarOutlined /> Returns & Refunds</span>,
            children: (
              <>
                <Title level={4}>Returns for Refund Processing ({returns.length})</Title>
        {returns.length === 0 ? (
          <Empty description="No returns assigned for refund processing" />
        ) : (
          <List
            dataSource={returns}
            renderItem={(returnRequest) => (
              <List.Item
                key={returnRequest._id}
                actions={[
                  <Button
                    key="view"
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(returnRequest)}
                  >
                    View Details
                  </Button>,
                  returnRequest.returnStatus === 'refund_processing' && !returnRequest.refundStatus && (
                    <Button
                      key="process"
                      type="default"
                      icon={<DollarOutlined />}
                      onClick={() => {
                        setSelectedReturn(returnRequest);
                        setDetailModalVisible(true);
                      }}
                    >
                      Process Refund
                    </Button>
                  ),
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>Return #{returnRequest._id.slice(-8)}</Text>
                      {getStatusTag(returnRequest.returnStatus, returnRequest.refundStatus)}
                    </Space>
                  }
                  description={
                    <div>
                      <div>Order: #{returnRequest.orderId._id.toString().slice(-8)}</div>
                      <div>Customer: {returnRequest.userId.fullName || returnRequest.userId.email}</div>
                      <div>
                        <Text strong>Refund Amount: </Text>
                        <Text style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>
                          ${(returnRequest.returnAmount / 100).toFixed(2)}
                        </Text>
                      </div>
                      {returnRequest.assignedSupportUser && (
                        <div>
                          <Text strong>Assigned by: </Text>
                          <Text>{returnRequest.assignedSupportUser.fullName || returnRequest.assignedSupportUser.email}</Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
              </>
            ),
          },
          {
            key: 'payouts',
            label: <span><BankOutlined /> Payouts to Sellers</span>,
            children: (
              <>
            {loadingPayouts ? (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
              </div>
            ) : payouts.length === 0 ? (
              <Empty description="No pending payouts" />
            ) : (
              <List
                dataSource={payouts}
                renderItem={(payout) => (
                  <List.Item
                    key={payout._id}
                    actions={[
                      <Button
                        key="view"
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewPayoutDetails(payout)}
                      >
                        View Details
                      </Button>,
                      payout.status === 'pending' && (
                        <Button
                          key="process"
                          type="default"
                          icon={<BankOutlined />}
                          onClick={() => {
                            setSelectedPayout(payout);
                            setPayoutDetailModalVisible(true);
                          }}
                        >
                          Process Payout
                        </Button>
                      ),
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>Payout #{payout._id.slice(-8)}</Text>
                          {getPayoutStatusTag(payout.status)}
                        </Space>
                      }
                      description={
                        <div>
                          <div>Order: #{payout.orderId?._id?.toString().slice(-8)}</div>
                          <div>
                            Seller: {payout.sellerId?.fullName || payout.sellerId?.email || 'Unknown'}
                          </div>
                          <div>
                            Product: {payout.productId?.title || 'Unknown Product'}
                          </div>
                          <div>
                            <Text strong>Payout Amount: </Text>
                            <Text style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>
                              ${(payout.payoutAmount / 100).toFixed(2)}
                            </Text>
                          </div>
                          {!payout.bankPayout?.accountNumber && (
                            <div>
                              <Tag color="warning">
                                <WarningOutlined /> Seller has not provided bank payout information
                              </Tag>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
              </>
            ),
          },
        ]} />
      </Card>

      {/* Returns Detail Modal */}
      <Modal
        title="Return Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedReturn(null);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setDetailModalVisible(false);
            setSelectedReturn(null);
          }}>
            Cancel
          </Button>,
          selectedReturn?.returnStatus === 'refund_processing' && !selectedReturn.refundStatus && (
            <Button
              key="process"
              type="primary"
              icon={<DollarOutlined />}
              loading={processing}
              onClick={handleProcessRefund}
            >
              Process Refund
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedReturn && (
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div><Text strong>Return ID: </Text>{selectedReturn._id}</div>
              <div><Text strong>Order ID: </Text>{selectedReturn.orderId._id}</div>
              <div><Text strong>Customer: </Text>{selectedReturn.userId.fullName || selectedReturn.userId.email}</div>
              <div>
                <Text strong>Refund Amount: </Text>
                <Text style={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}>
                  ${(selectedReturn.returnAmount / 100).toFixed(2)}
                </Text>
              </div>
              <div>
                <Text strong>Status: </Text>
                {getStatusTag(selectedReturn.returnStatus, selectedReturn.refundStatus)}
              </div>
              <div><Text strong>Payment Intent ID: </Text>{selectedReturn.orderId.paymentIntentId || 'N/A'}</div>
              <div><Text strong>Reason: </Text>{selectedReturn.reason}</div>
              {selectedReturn.proofImages && selectedReturn.proofImages.length > 0 && (
                <div>
                  <Text strong>Proof Images: </Text>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {selectedReturn.proofImages.map((image: string, index: number) => (
                      <Image
                        key={index}
                        src={`${process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3010'}${image}`}
                        alt={`Proof ${index + 1}`}
                        width={150}
                        height={150}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Text strong>Items: </Text>
                <List
                  size="small"
                  dataSource={selectedReturn.items}
                  renderItem={(item: any) => (
                    <List.Item>
                      {item.title} × {item.quantity} = ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                    </List.Item>
                  )}
                />
              </div>
              {selectedReturn.refundId && (
                <div>
                  <Text strong>Refund ID: </Text>
                  <Text copyable>{selectedReturn.refundId}</Text>
                </div>
              )}
              {selectedReturn.refundStatus && (
                <div>
                  <Text strong>Refund Status: </Text>
                  <Tag color={selectedReturn.refundStatus === 'succeeded' ? 'success' : selectedReturn.refundStatus === 'failed' ? 'error' : 'warning'}>
                    {selectedReturn.refundStatus.replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Tag>
                </div>
              )}
              {selectedReturn.inspectionResult && (
                <div>
                  <Text strong>Inspection Result: </Text>
                  <Tag color={selectedReturn.inspectionResult === 'accepted' ? 'success' : 'error'}>
                    {selectedReturn.inspectionResult.replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Tag>
                  {selectedReturn.inspectionNote && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Note: {selectedReturn.inspectionNote}</Text>
                    </div>
                  )}
                </div>
              )}
            </Space>
          </Card>
        )}
      </Modal>

      {/* Payout Detail Modal */}
      <Modal
        title="Payout Details"
        open={payoutDetailModalVisible}
        onCancel={() => {
          setPayoutDetailModalVisible(false);
          setSelectedPayout(null);
          setPayoutNotes('');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setPayoutDetailModalVisible(false);
            setSelectedPayout(null);
            setPayoutNotes('');
          }}>
            Cancel
          </Button>,
          selectedPayout?.status === 'pending' && (
            <>
              <Button
                key="cancelPayout"
                danger
                onClick={handleCancelPayout}
                loading={processingPayout}
              >
                Cancel Payout
              </Button>
              <Button
                key="process"
                type="primary"
                icon={<BankOutlined />}
                loading={processingPayout}
                onClick={handleProcessPayout}
                disabled={!selectedPayout?.bankPayout?.accountNumber}
              >
                Process Payout
              </Button>
            </>
          ),
        ]}
        width={800}
      >
        {selectedPayout && (
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Payout ID">{selectedPayout._id}</Descriptions.Item>
                <Descriptions.Item label="Order ID">{selectedPayout.orderId?._id?.toString() || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Product">{selectedPayout.productId?.title || 'Unknown Product'}</Descriptions.Item>
                <Descriptions.Item label="Seller">
                  {selectedPayout.sellerId?.fullName || selectedPayout.sellerId?.email || 'Unknown'}
                </Descriptions.Item>
                <Descriptions.Item label="Payout Amount">
                  <Text style={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}>
                    ${(selectedPayout.payoutAmount / 100).toFixed(2)} {selectedPayout.currency?.toUpperCase()}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {getPayoutStatusTag(selectedPayout.status)}
                </Descriptions.Item>
              </Descriptions>

              {selectedPayout.bankPayout ? (
                <Card size="small" title={<><BankOutlined /> Bank Payout Information</>}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Account Holder Name">
                      {selectedPayout.bankPayout.accountHolderName || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Account Number">
                      {selectedPayout.bankPayout.accountNumber ? `****${selectedPayout.bankPayout.accountNumber.slice(-4)}` : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bank Name">
                      {selectedPayout.bankPayout.bankName || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Routing Number">
                      {selectedPayout.bankPayout.routingNumber || 'N/A'}
                    </Descriptions.Item>
                    {selectedPayout.bankPayout.swiftCode && (
                      <Descriptions.Item label="SWIFT Code">{selectedPayout.bankPayout.swiftCode}</Descriptions.Item>
                    )}
                    {selectedPayout.bankPayout.iban && (
                      <Descriptions.Item label="IBAN">{selectedPayout.bankPayout.iban}</Descriptions.Item>
                    )}
                    {selectedPayout.bankPayout.accountType && (
                      <Descriptions.Item label="Account Type">
                        {selectedPayout.bankPayout.accountType.charAt(0).toUpperCase() + selectedPayout.bankPayout.accountType.slice(1)}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              ) : (
                <Alert
                  message="Seller has not provided bank payout information"
                  description="The seller needs to complete their bank payout information in their profile before the payout can be processed."
                  type="warning"
                  icon={<WarningOutlined />}
                  showIcon
                />
              )}

              {selectedPayout.status === 'pending' && (
                <div>
                  <Text strong>Notes (Optional):</Text>
                  <Input.TextArea
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    placeholder="Add notes about this payout..."
                    rows={4}
                    style={{ marginTop: 8 }}
                  />
                </div>
              )}

              {selectedPayout.processedBy && (
                <div>
                  <Text strong>Processed by: </Text>
                  {selectedPayout.processedBy?.fullName || selectedPayout.processedBy?.email || 'Unknown'}
                  {selectedPayout.processedAt && (
                    <div>
                      <Text strong>Processed at: </Text>
                      {new Date(selectedPayout.processedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {selectedPayout.notes && (
                <div>
                  <Text strong>Notes: </Text>
                  <Text>{selectedPayout.notes}</Text>
                </div>
              )}

              {selectedPayout.transferId && (
                <div>
                  <Text strong>Transfer ID: </Text>
                  <Text copyable>{selectedPayout.transferId}</Text>
                </div>
              )}

              {selectedPayout.failureReason && (
                <Alert
                  message="Payout Failed"
                  description={selectedPayout.failureReason}
                  type="error"
                  showIcon
                />
              )}
            </Space>
          </Card>
        )}
      </Modal>
    </div>
  );
};

export default FinanceDashboard;
