import { Form, Input, Space } from 'antd';
import { IAddress } from '@/types/user/userType';

interface AddressFormProps {
  form: any;
  namePrefix: string;
  label: string;
}

export const AddressForm = ({ form, namePrefix, label }: AddressFormProps) => {
  return (
    <div style={{ marginBottom: 24 }}>
      <h4 style={{ marginBottom: 16 }}>{label}</h4>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Form.Item
          name={[namePrefix, 'street']}
          label="Street Address"
        >
          <Input placeholder="123 Main St" />
        </Form.Item>
        <Form.Item
          name={[namePrefix, 'city']}
          label="City"
        >
          <Input placeholder="City" />
        </Form.Item>
        <Space.Compact style={{ width: '100%' }}>
          <Form.Item
            name={[namePrefix, 'state']}
            label="State"
            style={{ flex: 1 }}
          >
            <Input placeholder="State" />
          </Form.Item>
          <Form.Item
            name={[namePrefix, 'zipCode']}
            label="Zip Code"
            style={{ flex: 1 }}
          >
            <Input placeholder="12345" />
          </Form.Item>
        </Space.Compact>
        <Form.Item
          name={[namePrefix, 'country']}
          label="Country"
        >
          <Input placeholder="Country" />
        </Form.Item>
      </Space>
    </div>
  );
};

