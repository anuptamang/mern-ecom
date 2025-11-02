import React, { useEffect, useState } from 'react';
import { Card, List, Tag, Button, message, Empty, Spin, Typography, Space, Table, Badge } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getWorkloadDashboardApi } from 'services/endPoints/user/userListEndpoints';
import { MESSAGES } from '../../constants';
import './WorkloadDashboard.scss';

const { Text, Title } = Typography;

interface IWorkloadData {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  delivererType?: string;
  workload: {
    userId: string;
    userRole: string;
    activeDeliveries: number;
    activeReturns: number;
    totalActive: number;
    workloadStatus: 'free' | 'busy' | 'occupied' | 'unknown';
  };
}

interface IWorkloadDashboardProps {
  onUserClick?: (userId: string) => void;
}

const WorkloadDashboard: React.FC<IWorkloadDashboardProps> = ({ onUserClick }) => {
  const [loading, setLoading] = useState(true);
  const [workloadData, setWorkloadData] = useState<IWorkloadData[]>([]);
  const [grouped, setGrouped] = useState<{
    free: IWorkloadData[];
    busy: IWorkloadData[];
    occupied: IWorkloadData[];
    unknown: IWorkloadData[];
  }>({
    free: [],
    busy: [],
    occupied: [],
    unknown: [],
  });
  const [summary, setSummary] = useState({
    total: 0,
    free: 0,
    busy: 0,
    occupied: 0,
    unknown: 0,
  });

  useEffect(() => {
    loadWorkloadDashboard();
  }, []);

  const loadWorkloadDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await getWorkloadDashboardApi();
      setWorkloadData(data.workloadDashboard || []);
      setGrouped(data.grouped || { free: [], busy: [], occupied: [], unknown: [] });
      setSummary(data.summary || { total: 0, free: 0, busy: 0, occupied: 0, unknown: 0 });
    } catch (error: any) {
      message.error(error?.response?.data?.message || MESSAGES.ERROR.FAILED_TO_LOAD_WORKLOAD_DASHBOARD);
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadStatusTag = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      free: { color: 'success', icon: <CheckCircleOutlined /> },
      busy: { color: 'warning', icon: <ClockCircleOutlined /> },
      occupied: { color: 'error', icon: <CloseCircleOutlined /> },
      unknown: { color: 'default', icon: null },
    };
    const c = config[status] || config.unknown;
    return (
      <Badge status={c.color as any} text={status.charAt(0).toUpperCase() + status.slice(1)} />
    );
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      delivery_person: 'Delivery Person',
      warehouse_operator: 'Warehouse Operator',
      support_user: 'Support User',
      verification_team: 'Verification Team',
      return_inspector: 'Inspector',
      finance: 'Finance',
      delivery_agency: 'Delivery Agency',
      support: 'Support Admin',
    };
    return labels[role] || role;
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (record: IWorkloadData) => (
        <Space>
          <div>
            <div>
              <Text strong>{record.fullName}</Text>
            </div>
            <div>
              <Text type="secondary">{record.email}</Text>
            </div>
            {record.phone && (
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Phone: {record.phone}</Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (record: IWorkloadData) => (
        <Space>
          <Tag color="blue">{getRoleLabel(record.role)}</Tag>
          {record.delivererType && (
            <Tag color="cyan">{record.delivererType}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Active Deliveries',
      key: 'deliveries',
      align: 'center' as const,
      render: (record: IWorkloadData) => (
        <Text strong>{record.workload.activeDeliveries}</Text>
      ),
    },
    {
      title: 'Active Returns',
      key: 'returns',
      align: 'center' as const,
      render: (record: IWorkloadData) => (
        <Text strong>{record.workload.activeReturns}</Text>
      ),
    },
    {
      title: 'Total Active',
      key: 'total',
      align: 'center' as const,
      render: (record: IWorkloadData) => (
        <Text strong style={{ fontSize: 16 }}>{record.workload.totalActive}</Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center' as const,
      render: (record: IWorkloadData) => getWorkloadStatusTag(record.workload.workloadStatus),
    },
  ];

  return (
    <div className="workload-dashboard">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <Title level={2}>Workload Dashboard</Title>
            <Text type="secondary">Monitor team member availability and workload</Text>
          </div>
          <Button onClick={loadWorkloadDashboard} loading={loading}>
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <Space size="large" style={{ marginBottom: 24 }}>
          <Card size="small">
            <Space direction="vertical" size="small" align="center">
              <Text type="secondary">Total Team Members</Text>
              <Title level={3} style={{ margin: 0 }}>{summary.total}</Title>
            </Space>
          </Card>
          <Card size="small">
            <Space direction="vertical" size="small" align="center">
              <Text type="secondary">Available</Text>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>{summary.free}</Title>
            </Space>
          </Card>
          <Card size="small">
            <Space direction="vertical" size="small" align="center">
              <Text type="secondary">Busy</Text>
              <Title level={3} style={{ margin: 0, color: '#faad14' }}>{summary.busy}</Title>
            </Space>
          </Card>
          <Card size="small">
            <Space direction="vertical" size="small" align="center">
              <Text type="secondary">Occupied</Text>
              <Title level={3} style={{ margin: 0, color: '#ff4d4f' }}>{summary.occupied}</Title>
            </Space>
          </Card>
        </Space>

        {/* Workload Table */}
        <Spin spinning={loading}>
          {workloadData.length === 0 ? (
            <Empty description="No team members found" />
          ) : (
            <Table
              dataSource={workloadData}
              columns={columns}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              onRow={(record) => ({
                onClick: () => {
                  if (onUserClick) {
                    onUserClick(record._id);
                  }
                },
                style: { cursor: onUserClick ? 'pointer' : 'default' },
              })}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default WorkloadDashboard;
