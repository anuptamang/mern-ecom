import { Card, Tag, Timeline, Typography, Spin, Alert } from 'antd';
import { 
  DollarOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getRefundStatusApi } from 'services/endPoints/delivery';

const { Text, Title } = Typography;

interface RefundStatusProps {
  orderId: string;
  order?: any;
}

interface IRefundStatus {
  orderId: string;
  refundId?: string;
  refundStatus?: string;
  refundAmount?: number;
  refundCreatedAt?: string;
  refundCompletedAt?: string;
  refundFailureReason?: string;
  refundDetails?: any;
}

export const RefundStatus = ({ orderId, order }: RefundStatusProps) => {
  const [refundInfo, setRefundInfo] = useState<IRefundStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRefundStatus = async () => {
      try {
        const { data } = await getRefundStatusApi(orderId);
        setRefundInfo(data);
      } catch (error: any) {
        console.error('Error loading refund status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadRefundStatus();
    }
  }, [orderId]);

  if (loading) {
    return <Spin />;
  }

  if (!refundInfo || !refundInfo.refundStatus) {
    return null; // No refund information available
  }

  const getStatusConfig = (status?: string) => {
    const configs: Record<string, { color: string; icon: any; text: string }> = {
      pending: {
        color: 'warning',
        icon: <ClockCircleOutlined />,
        text: 'Refund Pending',
      },
      processing: {
        color: 'processing',
        icon: <ClockCircleOutlined />,
        text: 'Processing Refund',
      },
      succeeded: {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'Refund Completed',
      },
      failed: {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'Refund Failed',
      },
      canceled: {
        color: 'default',
        icon: <ExclamationCircleOutlined />,
        text: 'Refund Canceled',
      },
    };

    return configs[status || 'pending'] || configs.pending;
  };

  const statusConfig = getStatusConfig(refundInfo.refundStatus);
  const refundAmount = refundInfo.refundAmount || refundInfo.refundDetails?.amount || order?.amount || 0;

  return (
    <Card title="Refund Status" className="refund-status">
      <div className="mb-4">
        <Tag color={statusConfig.color} icon={statusConfig.icon} style={{ fontSize: '14px', padding: '4px 12px' }}>
          {statusConfig.text}
        </Tag>
      </div>

      {refundInfo.refundId && (
        <div className="mb-4">
          <Text strong>Refund ID: </Text>
          <Text code>{refundInfo.refundId}</Text>
        </div>
      )}

      <div className="mb-4">
        <Text strong>Refund Amount: </Text>
        <Text style={{ fontSize: '16px', color: 'var(--theme-primary, #1890ff)' }}>
          ${(refundAmount / 100).toFixed(2)} {order?.currency?.toUpperCase() || 'USD'}
        </Text>
      </div>

      {refundInfo.refundCreatedAt && (
        <div className="mb-4">
          <Text strong>Refund Requested: </Text>
          <Text>
            {new Date(refundInfo.refundCreatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </div>
      )}

      {refundInfo.refundCompletedAt && (
        <div className="mb-4">
          <Text strong>Refund Completed: </Text>
          <Text>
            {new Date(refundInfo.refundCompletedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </div>
      )}

      {refundInfo.refundFailureReason && (
        <Alert
          message="Refund Issue"
          description={refundInfo.refundFailureReason}
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <div className="mt-4">
        <Title level={5}>Refund Timeline</Title>
        <Timeline>
          <Timeline.Item
            color="blue"
            dot={<DollarOutlined />}
          >
            <div>
              <Text strong>Refund Requested</Text>
              {refundInfo.refundCreatedAt && (
                <div>
                  <Text type="secondary">
                    {new Date(refundInfo.refundCreatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </div>
              )}
            </div>
          </Timeline.Item>

          {refundInfo.refundStatus === 'processing' && (
            <Timeline.Item
              color="blue"
              dot={<ClockCircleOutlined />}
            >
              <div>
                <Text strong>Processing Refund</Text>
                <div>
                  <Text type="secondary">Your refund is being processed by the payment provider</Text>
                </div>
              </div>
            </Timeline.Item>
          )}

          {refundInfo.refundStatus === 'succeeded' && refundInfo.refundCompletedAt && (
            <Timeline.Item
              color="green"
              dot={<CheckCircleOutlined />}
            >
              <div>
                <Text strong>Refund Completed</Text>
                <div>
                  <Text type="secondary">
                    {new Date(refundInfo.refundCompletedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </div>
                <div>
                  <Text type="secondary">Refund has been processed and should appear in your account within 5-10 business days</Text>
                </div>
              </div>
            </Timeline.Item>
          )}

          {refundInfo.refundStatus === 'failed' && (
            <Timeline.Item
              color="red"
              dot={<CloseCircleOutlined />}
            >
              <div>
                <Text strong>Refund Failed</Text>
                {refundInfo.refundFailureReason && (
                  <div>
                    <Text type="secondary">{refundInfo.refundFailureReason}</Text>
                  </div>
                )}
              </div>
            </Timeline.Item>
          )}
        </Timeline>
      </div>
    </Card>
  );
};
