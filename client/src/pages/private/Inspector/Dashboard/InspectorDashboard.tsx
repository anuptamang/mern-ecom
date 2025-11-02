import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, message, Empty, Spin, Typography, Space, Modal, Input, Radio } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from 'hooks';
import { useSearchParams } from 'react-router-dom';
import {
  getReturnRequestApi,
} from 'services/endPoints/return';
import {
  getInspectorReturnsApi,
  inspectReturnApi,
} from 'services/endPoints/return/returnWorkflowEndpoints';
import './InspectorDashboard.scss';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface IReturn {
  _id: string;
  orderId: { _id: string; items: any[] };
  userId: { fullName: string; email: string };
  items: any[];
  returnAmount: number;
  reason: string;
  proofImages?: string[];
  returnStatus: string;
  assignedInspector?: any;
}

const InspectorDashboard = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [returns, setReturns] = useState<IReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<IReturn | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [inspectModalVisible, setInspectModalVisible] = useState(false);
  const [inspectionResult, setInspectionResult] = useState<'accepted' | 'rejected'>('accepted');
  const [inspectionNote, setInspectionNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [inspecting, setInspecting] = useState(false);

  useEffect(() => {
    loadReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle URL params for notification navigation
  useEffect(() => {
    const returnId = searchParams.get('returnId');
    if (returnId) {
      loadReturnById(returnId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const { data } = await getInspectorReturnsApi();
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
        // Auto-open inspect modal if return is ready for inspection
        if (data.returnRequest.returnStatus === 'inspector_assigned') {
          setInspectModalVisible(true);
        }
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

  const handleInspect = async () => {
    if (!selectedReturn) return;

    if (inspectionResult === 'rejected' && !rejectionReason.trim()) {
      message.warning('Please provide a rejection reason');
      return;
    }

    try {
      setInspecting(true);
      await inspectReturnApi(
        selectedReturn._id,
        inspectionResult,
        inspectionNote || undefined,
        rejectionReason || undefined
      );
      message.success(`Inspection ${inspectionResult} successfully`);
      setInspectModalVisible(false);
      setInspectionResult('accepted');
      setInspectionNote('');
      setRejectionReason('');
      loadReturns();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to submit inspection');
    } finally {
      setInspecting(false);
    }
  };

  const getStatusTag = (status: string) => {
    return (
      <Tag color="blue">
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
    <div className="inspector-dashboard">
      <Card>
        <Title level={2}>Return Inspector Dashboard</Title>
        <Text type="secondary">
          Inspect return packages and accept or reject returns based on item condition.
        </Text>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Assigned Returns ({returns.length})</Title>
        {returns.length === 0 ? (
          <Empty description="No returns assigned for inspection" />
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
                  <Button
                    type="default"
                    icon={inspectionResult === 'accepted' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    onClick={() => {
                      setSelectedReturn(returnRequest);
                      setInspectModalVisible(true);
                    }}
                  >
                    Inspect
                  </Button>,
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
                      <div>Amount: ${(returnRequest.returnAmount / 100).toFixed(2)}</div>
                      <div>Reason: {returnRequest.reason}</div>
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
              <div><Text strong>Amount: </Text>${(selectedReturn.returnAmount / 100).toFixed(2)}</div>
              <div><Text strong>Reason: </Text>{selectedReturn.reason}</div>
              
              {selectedReturn.proofImages && selectedReturn.proofImages.length > 0 && (
                <div>
                  <Text strong>Proof Images: </Text>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {selectedReturn.proofImages.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={`${process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:3010'}${image}`}
                        alt={`Proof ${index + 1}`}
                        style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 4 }}
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
                    <List.Item>{item.title} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}</List.Item>
                  )}
                />
              </div>
            </Space>
          </Card>
        )}
      </Modal>

      <Modal
        title="Inspect Return Package"
        open={inspectModalVisible}
        onOk={handleInspect}
        onCancel={() => {
          setInspectModalVisible(false);
          setSelectedReturn(null);
          setInspectionResult('accepted');
          setInspectionNote('');
          setRejectionReason('');
        }}
        okText="Submit Inspection"
        okButtonProps={{ loading: inspecting }}
        width={600}
      >
        {selectedReturn && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Return ID: </Text>{selectedReturn._id.slice(-8)}
            </div>
            <div>
              <Text strong>Inspection Result: </Text>
              <Radio.Group
                value={inspectionResult}
                onChange={(e) => setInspectionResult(e.target.value)}
                style={{ marginTop: 8 }}
              >
                <Radio.Button value="accepted">
                  <CheckCircleOutlined /> Accept
                </Radio.Button>
                <Radio.Button value="rejected">
                  <CloseCircleOutlined /> Reject
                </Radio.Button>
              </Radio.Group>
            </div>
            
            <div>
              <Text strong>Inspection Note: </Text>
              <TextArea
                rows={3}
                placeholder="Add inspection notes (optional)"
                value={inspectionNote}
                onChange={(e) => setInspectionNote(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>

            {inspectionResult === 'rejected' && (
              <div>
                <Text strong>Rejection Reason <span style={{ color: 'red' }}>*</span>: </Text>
                <TextArea
                  rows={3}
                  placeholder="Please explain why the return is rejected (required)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default InspectorDashboard;
