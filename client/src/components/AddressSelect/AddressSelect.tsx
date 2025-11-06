import { Radio, Card, Typography, Space, Button, message } from 'antd';
import { IAddress, IUser } from '@/types/user/userType';
import { EditOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Text } = Typography;

interface AddressSelectProps {
  user: IUser;
  onSelect: (address: IAddress | null, addressType: 'primary' | 'secondary') => void;
  selectedAddressType?: 'primary' | 'secondary';
}

export const AddressSelect = ({ user, onSelect, selectedAddressType }: AddressSelectProps) => {
  const [selected, setSelected] = useState<'primary' | 'secondary' | null>(
    selectedAddressType || (user.primaryAddress?.street ? 'primary' : 'secondary')
  );

  const handleChange = (e: any) => {
    const value = e.target.value as 'primary' | 'secondary';
    setSelected(value);
    const address = value === 'primary' ? user.primaryAddress : user.secondaryAddress;
    onSelect(address || null, value);
  };

  const formatAddress = (address: IAddress | undefined) => {
    if (!address || !address.street) return 'No address set';
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  const hasPrimary = user.primaryAddress?.street;
  const hasSecondary = user.secondaryAddress?.street;

  if (!hasPrimary && !hasSecondary) {
    return (
      <Card>
        <Text type="warning">
          No delivery address set. Please add an address in your profile settings.
        </Text>
      </Card>
    );
  }

  return (
    <Radio.Group onChange={handleChange} value={selected} style={{ width: '100%' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {hasPrimary && (
          <Radio value="primary" style={{ width: '100%' }}>
            <Card size="small" style={{ marginTop: 8 }}>
              <div>
                <Text strong>Primary Address</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">{formatAddress(user.primaryAddress)}</Text>
                </div>
              </div>
            </Card>
          </Radio>
        )}
        {hasSecondary && (
          <Radio value="secondary" style={{ width: '100%' }}>
            <Card size="small" style={{ marginTop: 8 }}>
              <div>
                <Text strong>Secondary Address</Text>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">{formatAddress(user.secondaryAddress)}</Text>
                </div>
              </div>
            </Card>
          </Radio>
        )}
      </Space>
    </Radio.Group>
  );
};

