import React, { useState } from 'react';
import { Card, Tabs, Typography, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { BannerManagement, ThemeManagement } from 'components';
import './AdminSettings.scss';

const { Title, Text } = Typography;

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('theme');

  const tabItems = [
    {
      key: 'theme',
      label: 'Theme Settings',
      children: (
        <ThemeManagement />
      ),
    },
    {
      key: 'banners',
      label: 'Banner Management',
      children: (
        <BannerManagement />
      ),
    },
  ];

  return (
    <div className="admin-settings">
      <Card>
        <div className="settings-header">
          <Space>
            <SettingOutlined style={{ fontSize: 24 }} />
            <div>
              <Title level={2} style={{ margin: 0 }}>Admin Settings</Title>
              <Text type="secondary">
                Manage site appearance, banners, and configuration
              </Text>
            </div>
          </Space>
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default AdminSettings;
