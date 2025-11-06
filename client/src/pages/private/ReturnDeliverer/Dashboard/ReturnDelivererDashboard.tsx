'use client';

import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, message, Empty, Spin, Typography, Space, Modal, Input, Upload } from 'antd';
import { CarOutlined, CheckCircleOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks';
import { useSearchParams } from 'next/navigation';
import {
  getReturnRequestApi,
  markReturnPickedUpApi,
  getReturnDelivererReturnsApi,
} from '@/services/endPoints/return';
import { submitToSupportApi, markReturnDeliveredApi } from '@/services/endPoints/return/returnWorkflowEndpoints';
import { getToken } from '@/utils/localStorage';
import type { UploadFile } from 'antd';
import './ReturnDelivererDashboard.scss';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface IReturn {
  _id: string;
  orderId: { 
    _id: string; 
    items: any[];
    deliveryAddress?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  };
  userId: { fullName: string; email: string; phone?: string };
  items: any[];
  returnAmount: number;
  reason: string;
  returnStatus: string;
  assignedReturnDeliverer?: any;
  pickedUpAt?: Date;
  pickupProof?: string;
  inspectionResult?: 'accepted' | 'rejected' | 'pending';
}

const ReturnDelivererDashboard = () => {
  const auth = useAuth();
  const searchParams = useSearchParams();
  const [returns, setReturns] = useState<IReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<IReturn | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [pickupNote, setPickupNote] = useState('');
  const [pickupProof, setPickupProof] = useState<UploadFile[]>([]);
  const [markingPickedUp, setMarkingPickedUp] = useState(false);
  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [submitNote, setSubmitNote] = useState('');
  const [submittingToSupport, setSubmittingToSupport] = useState(false);
  const [deliverModalVisible, setDeliverModalVisible] = useState(false);
  const [deliverNote, setDeliverNote] = useState('');
  const [markingDelivered, setMarkingDelivered] = useState(false);

  useEffect(() => {
    loadReturns();
  }, []);

  // Handle URL params for notification navigation
  useEffect(() => {
    const returnId = searchParams.get('returnId');
    if (returnId) {
      // Check if return already in list
      const existingReturn = returns.find(r => String(r._id) === returnId);
      if (existingReturn) {
        // Auto-open details modal if return is ready for pickup (initial return or re-delivery)
        if (existingReturn.returnStatus === 'assigned_deliverer' || existingReturn.returnStatus === 're_delivery') {
          handleViewDetails(existingReturn);
        }
      } else {
        // Load return if not in list
        loadReturnById(returnId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, returns]);

  const loadReturnById = async (returnId: string) => {
    try {
      const { data } = await getReturnRequestApi(returnId);
      if (data.returnRequest) {
        // Add to returns list if not already there
        setReturns(prev => {
          if (!prev.find(r => String(r._id) === returnId)) {
            return [data.returnRequest, ...prev];
          }
          return prev;
        });
        // Auto-open details modal if return is ready for pickup (initial return or re-delivery)
        if (data.returnRequest.returnStatus === 'assigned_deliverer' || data.returnRequest.returnStatus === 're_delivery') {
          handleViewDetails(data.returnRequest);
        }
      }
    } catch (error: any) {
      console.error('Failed to load return details:', error);
      message.error(error?.response?.data?.message || 'Failed to load return details');
    }
  };

  const loadReturns = async () => {
    try {
      setLoading(true);
      // Get returns assigned to this return deliverer using dedicated endpoint
      const { data } = await getReturnDelivererReturnsApi();
      setReturns(data.returns || []);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load returns');
    } finally {
      setLoading(false);
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

  const handleMarkPickedUp = async () => {
    if (!selectedReturn) return;

    try {
      setMarkingPickedUp(true);
      const proofFile = pickupProof.find(f => f.originFileObj)?.originFileObj as File | undefined;
      await markReturnPickedUpApi(selectedReturn._id, pickupNote || undefined, proofFile);
      message.success('Return marked as picked up successfully');
      setPickupModalVisible(false);
      setPickupNote('');
      setPickupProof([]);
      setSelectedReturn(null);
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to mark return as picked up');
    } finally {
      setMarkingPickedUp(false);
    }
  };

  const handleSubmitToSupport = async () => {
    if (!selectedReturn) return;

    try {
      setSubmittingToSupport(true);
      await submitToSupportApi(selectedReturn._id, submitNote || undefined);
      message.success('Return submitted to support team successfully');
      setSubmitModalVisible(false);
      setSubmitNote('');
      setSelectedReturn(null);
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to submit return to support');
    } finally {
      setSubmittingToSupport(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!selectedReturn) return;

    try {
      setMarkingDelivered(true);
      await markReturnDeliveredApi(selectedReturn._id, deliverNote || undefined);
      message.success('Return delivered to buyer successfully');
      setDeliverModalVisible(false);
      setDeliverNote('');
      setSelectedReturn(null);
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to mark return as delivered');
    } finally {
      setMarkingDelivered(false);
    }
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      assigned_deliverer: { color: 'blue', icon: <CarOutlined /> },
      picked_up: { color: 'processing', icon: <CarOutlined /> },
      submitted_to_support: { color: 'success', icon: <CheckCircleOutlined /> },
      re_delivery: { color: 'orange', icon: <CarOutlined /> },
      completed: { color: 'success', icon: <CheckCircleOutlined /> },
    };
    const c = config[status] || { color: 'default', icon: null };
    return (
      <Tag color={c.color} icon={c.icon}>
        {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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

  return (
    <div className="return-deliverer-dashboard">
      <Card>
        <Title level={2}>Return Deliverer Dashboard</Title>
        <Text type="secondary">
          Pick up return packages from buyers and deliver them to the verification facility.
        </Text>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Assigned Returns ({returns.length})</Title>
        {returns.length === 0 ? (
          <Empty description="No returns assigned for pickup" />
        ) : (
          <List
            dataSource={returns}
            renderItem={(returnRequest) => (
              <List.Item
                key={returnRequest._id}
                actions={[
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(returnRequest)}
                  >
                    View Details
                  </Button>,
                  // Show "Mark as Picked Up" for initial return (assigned_deliverer) or re-delivery (re_delivery)
                  (returnRequest.returnStatus === 'assigned_deliverer' || returnRequest.returnStatus === 're_delivery') && (
                    <Button
                      type="default"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        setSelectedReturn(returnRequest);
                        setPickupModalVisible(true);
                      }}
                    >
                      {returnRequest.returnStatus === 're_delivery' ? 'Pick Up from Support' : 'Mark as Picked Up'}
                    </Button>
                  ),
                  // Show "Submit to Support" for regular returns (picked up from buyer)
                  returnRequest.returnStatus === 'picked_up' && returnRequest.inspectionResult !== 'rejected' && (
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        setSelectedReturn(returnRequest);
                        setSubmitModalVisible(true);
                      }}
                    >
                      Submit to Support
                    </Button>
                  ),
                  // Show "Mark as Delivered" for re-delivery (picked up from support, rejected return)
                  returnRequest.returnStatus === 'picked_up' && returnRequest.inspectionResult === 'rejected' && (
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => {
                        setSelectedReturn(returnRequest);
                        setDeliverModalVisible(true);
                      }}
                    >
                      Mark as Delivered to Buyer
                    </Button>
                  ),
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>Return #{returnRequest._id.slice(-8)}</Text>
                      {getStatusTag(returnRequest.returnStatus)}
                    </Space>
                  }
                  description={
                    <div>
                      <div>Order: #{returnRequest.orderId._id.toString().slice(-8)}</div>
                      <div>Customer: {returnRequest.userId.fullName || returnRequest.userId.email}</div>
                      {returnRequest.userId.phone && (
                        <div>Phone: {returnRequest.userId.phone}</div>
                      )}
                      <div>Amount: ${(returnRequest.returnAmount / 100).toFixed(2)}</div>
                      {returnRequest.pickedUpAt && (
                        <div>
                          <Text type="secondary">Picked up: {new Date(returnRequest.pickedUpAt).toLocaleString()}</Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title="Return Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedReturn(null);
        }}
        footer={null}
        width={800}
      >
        {selectedReturn && (
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div><Text strong>Return ID: </Text>{selectedReturn._id}</div>
              <div><Text strong>Order ID: </Text>{selectedReturn.orderId._id}</div>
              <div><Text strong>Customer: </Text>{selectedReturn.userId.fullName || selectedReturn.userId.email}</div>
              {selectedReturn.userId.phone && (
                <div><Text strong>Phone: </Text>{selectedReturn.userId.phone}</div>
              )}
              {selectedReturn.orderId.deliveryAddress && (
                <div>
                  <Text strong>Pickup Address: </Text>
                  {selectedReturn.orderId.deliveryAddress.street && (
                    <div>{selectedReturn.orderId.deliveryAddress.street}</div>
                  )}
                  <div>
                    {selectedReturn.orderId.deliveryAddress.city || ""}
                    {selectedReturn.orderId.deliveryAddress.city && selectedReturn.orderId.deliveryAddress.state ? ", " : ""}
                    {selectedReturn.orderId.deliveryAddress.state || ""} {selectedReturn.orderId.deliveryAddress.zipCode || ""}
                  </div>
                  {selectedReturn.orderId.deliveryAddress.country && (
                    <div>{selectedReturn.orderId.deliveryAddress.country}</div>
                  )}
                </div>
              )}
              <div><Text strong>Amount: </Text>${(selectedReturn.returnAmount / 100).toFixed(2)}</div>
              <div><Text strong>Reason: </Text>{selectedReturn.reason}</div>
              <div>
                <Text strong>Items: </Text>
                <List
                  size="small"
                  dataSource={selectedReturn.items}
                  renderItem={(item: any) => (
                    <List.Item>{item.title} × {item.quantity}</List.Item>
                  )}
                />
              </div>
              {selectedReturn.pickupProof && (
                <div>
                  <Text strong>Pickup Proof: </Text>
                  <img
                    src={`${process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3010'}${selectedReturn.pickupProof}`}
                    alt="Pickup proof"
                    style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 4, marginTop: 8 }}
                  />
                </div>
              )}
            </Space>
          </Card>
        )}
      </Modal>

      <Modal
        title={selectedReturn?.returnStatus === 're_delivery' ? "Pick Up from Support" : "Mark Return as Picked Up"}
        open={pickupModalVisible}
        onOk={handleMarkPickedUp}
        onCancel={() => {
          setPickupModalVisible(false);
          setSelectedReturn(null);
          setPickupNote('');
          setPickupProof([]);
        }}
        okText={selectedReturn?.returnStatus === 're_delivery' ? "Confirm Pickup from Support" : "Confirm Pickup"}
        okButtonProps={{ loading: markingPickedUp }}
        width={600}
      >
        {selectedReturn && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Return ID: </Text>{selectedReturn._id.slice(-8)}
            </div>
            {selectedReturn.returnStatus === 're_delivery' ? (
              <>
                <div>
                  <Text strong>Pickup Location: </Text>Support Team
                </div>
                <div>
                  <Text strong>Delivery Location: </Text>{selectedReturn.userId.fullName || selectedReturn.userId.email}
                  {selectedReturn.userId.phone && ` (${selectedReturn.userId.phone})`}
                  {selectedReturn.orderId.deliveryAddress && (
                    <div style={{ marginTop: 8, marginLeft: 20 }}>
                      <Text type="secondary">
                        {selectedReturn.orderId.deliveryAddress.street && `${selectedReturn.orderId.deliveryAddress.street}, `}
                        {selectedReturn.orderId.deliveryAddress.city || ''}
                        {selectedReturn.orderId.deliveryAddress.city && selectedReturn.orderId.deliveryAddress.state ? ', ' : ''}
                        {selectedReturn.orderId.deliveryAddress.state || ''} {selectedReturn.orderId.deliveryAddress.zipCode || ''}
                        {selectedReturn.orderId.deliveryAddress.country && `, ${selectedReturn.orderId.deliveryAddress.country}`}
                      </Text>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div>
                <Text strong>Customer: </Text>{selectedReturn.userId.fullName || selectedReturn.userId.email}
                {selectedReturn.userId.phone && ` (${selectedReturn.userId.phone})`}
              </div>
            )}
            <div>
              <Text strong>Pickup Note (optional): </Text>
              <TextArea
                rows={3}
                placeholder={selectedReturn.returnStatus === 're_delivery' ? "Add any notes about picking up from support" : "Add any notes about the pickup"}
                value={pickupNote}
                onChange={(e) => setPickupNote(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
            <div>
              <Text strong>Pickup Proof Image (optional): </Text>
              <Upload
                listType="picture-card"
                fileList={pickupProof}
                onChange={({ fileList }) => setPickupProof(fileList)}
                beforeUpload={() => false}
                maxCount={1}
                accept="image/*"
              >
                {pickupProof.length < 1 && (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </div>
          </Space>
        )}
      </Modal>

      <Modal
        title="Submit Return to Support"
        open={submitModalVisible}
        onOk={handleSubmitToSupport}
        onCancel={() => {
          setSubmitModalVisible(false);
          setSelectedReturn(null);
          setSubmitNote('');
        }}
        okText="Submit to Support"
        okButtonProps={{ loading: submittingToSupport }}
        width={600}
      >
        {selectedReturn && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Return ID: </Text>{selectedReturn._id.slice(-8)}
            </div>
            <div>
              <Text strong>Customer: </Text>{selectedReturn.userId.fullName || selectedReturn.userId.email}
              {selectedReturn.userId.phone && ` (${selectedReturn.userId.phone})`}
            </div>
            <div>
              <Text strong>Submission Note (optional): </Text>
              <TextArea
                rows={3}
                placeholder="Add any notes about the submission"
                value={submitNote}
                onChange={(e) => setSubmitNote(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        )}
      </Modal>

      <Modal
        title="Mark as Delivered to Buyer"
        open={deliverModalVisible}
        onOk={handleMarkDelivered}
        onCancel={() => {
          setDeliverModalVisible(false);
          setSelectedReturn(null);
          setDeliverNote('');
        }}
        okText="Mark as Delivered"
        okButtonProps={{ loading: markingDelivered }}
        width={600}
      >
        {selectedReturn && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Return ID: </Text>{selectedReturn._id.slice(-8)}
            </div>
            <div>
              <Text strong>Customer: </Text>{selectedReturn.userId.fullName || selectedReturn.userId.email}
              {selectedReturn.userId.phone && ` (${selectedReturn.userId.phone})`}
            </div>
            {selectedReturn.orderId.deliveryAddress && (
              <div>
                <Text strong>Delivery Address: </Text>
                <div style={{ marginTop: 8, marginLeft: 20 }}>
                  <Text>
                    {selectedReturn.orderId.deliveryAddress.street && `${selectedReturn.orderId.deliveryAddress.street}, `}
                    {selectedReturn.orderId.deliveryAddress.city || ''}
                    {selectedReturn.orderId.deliveryAddress.city && selectedReturn.orderId.deliveryAddress.state ? ', ' : ''}
                    {selectedReturn.orderId.deliveryAddress.state || ''} {selectedReturn.orderId.deliveryAddress.zipCode || ''}
                    {selectedReturn.orderId.deliveryAddress.country && `, ${selectedReturn.orderId.deliveryAddress.country}`}
                  </Text>
                </div>
              </div>
            )}
            <div>
              <Text strong>Delivery Note (optional): </Text>
              <TextArea
                rows={3}
                placeholder="Add any notes about the delivery to buyer"
                value={deliverNote}
                onChange={(e) => setDeliverNote(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
            <div>
              <Text type="secondary">
                This return was rejected during inspection. You are re-delivering the package back to the buyer.
              </Text>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ReturnDelivererDashboard;
