'use client';

import styles from '@/assets/styles/Common.module.scss';
import { Container } from '@/components/UI';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, Typography, Space, Divider } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';

const { Title, Paragraph, Text } = Typography;

const ContactPage = () => {
  const title = usePageTitle();
  const { result } = useAppSelector(authSelector);
  const userRole = result?.role;

  // Role-specific contact information
  const getRoleSpecificContent = () => {
    switch (userRole) {
      case 'seller':
        return {
          title: 'Seller Support',
          description: 'Need help with your store? Our seller support team is here to assist you with product listings, order management, payments, and more.',
          email: 'seller-support@ecommerce.com',
          phone: '+1 (555) 123-4567',
          hours: 'Monday - Friday: 9:00 AM - 6:00 PM EST',
        };
      case 'delivery_agency':
        return {
          title: 'Delivery Agency Support',
          description: 'Contact us for delivery assignments, delivery management, driver coordination, and logistics support.',
          email: 'delivery-support@ecommerce.com',
          phone: '+1 (555) 234-5678',
          hours: 'Monday - Sunday: 8:00 AM - 8:00 PM EST',
        };
      case 'delivery_person':
        return {
          title: 'Delivery Personnel Support',
          description: 'Get assistance with delivery assignments, tracking, route optimization, and delivery issues.',
          email: 'deliverer-support@ecommerce.com',
          phone: '+1 (555) 234-5679',
          hours: 'Monday - Sunday: 8:00 AM - 8:00 PM EST',
        };
      case 'warehouse_operator':
        return {
          title: 'Warehouse Operator Support',
          description: 'Need help with warehouse operations, inventory management, or facility coordination?',
          email: 'warehouse-support@ecommerce.com',
          phone: '+1 (555) 345-6789',
          hours: 'Monday - Friday: 8:00 AM - 6:00 PM EST',
        };
      case 'support':
      case 'support_user':
        return {
          title: 'Support Team Resources',
          description: 'Internal resources and contacts for support team members.',
          email: 'support-admin@ecommerce.com',
          phone: '+1 (555) 456-7890',
          hours: '24/7 Support Available',
        };
      case 'verification_team':
        return {
          title: 'Verification Team Support',
          description: 'Resources and contacts for verification team operations.',
          email: 'verification-support@ecommerce.com',
          phone: '+1 (555) 567-8901',
          hours: 'Monday - Friday: 9:00 AM - 5:00 PM EST',
        };
      case 'return_inspector':
        return {
          title: 'Inspector Support',
          description: 'Get help with return inspections, quality checks, and inspection procedures.',
          email: 'inspector-support@ecommerce.com',
          phone: '+1 (555) 567-8902',
          hours: 'Monday - Friday: 9:00 AM - 5:00 PM EST',
        };
      case 'finance':
        return {
          title: 'Finance Team Support',
          description: 'Resources and contacts for finance and refund operations.',
          email: 'finance-support@ecommerce.com',
          phone: '+1 (555) 678-9012',
          hours: 'Monday - Friday: 9:00 AM - 5:00 PM EST',
        };
      case 'admin':
        return {
          title: 'Administrator Support',
          description: 'System administration and management resources.',
          email: 'admin-support@ecommerce.com',
          phone: '+1 (555) 789-0123',
          hours: '24/7 Support Available',
        };
      default:
        return {
          title: 'Customer Support',
          description: 'Have questions about your order, delivery, returns, or need help with our platform? Our customer support team is here to help you.',
          email: 'support@ecommerce.com',
          phone: '+1 (555) 000-0000',
          hours: 'Monday - Sunday: 8:00 AM - 10:00 PM EST',
        };
    }
  };

  const content = getRoleSpecificContent();

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Title level={2}>{content.title}</Title>
              <Paragraph>{content.description}</Paragraph>
            </div>

            <Divider />

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <MailOutlined style={{ fontSize: 20, color: 'var(--theme-primary, #1890ff)' }} />
                <Text strong>Email:</Text>
                <a href={`mailto:${content.email}`}>{content.email}</a>
              </Space>

              <Space>
                <PhoneOutlined style={{ fontSize: 20, color: 'var(--theme-primary, #1890ff)' }} />
                <Text strong>Phone:</Text>
                <a href={`tel:${content.phone}`}>{content.phone}</a>
              </Space>

              <Space>
                <ClockCircleOutlined style={{ fontSize: 20, color: 'var(--theme-primary, #1890ff)' }} />
                <Text strong>Support Hours:</Text>
                <Text>{content.hours}</Text>
              </Space>

              <Space>
                <EnvironmentOutlined style={{ fontSize: 20, color: 'var(--theme-primary, #1890ff)' }} />
                <Text strong>Address:</Text>
                <Text>123 Commerce Street, Business District, City, State 12345</Text>
              </Space>
            </Space>

            <Divider />

            <div>
              <Title level={4}>General Inquiries</Title>
              <Paragraph>
                For general questions, feedback, or concerns, please feel free to reach out to us using the contact information above.
                We aim to respond to all inquiries within 24-48 hours during business days.
              </Paragraph>
            </div>

            {userRole && (
              <div>
                <Title level={4}>Your Role</Title>
                <Paragraph>
                  You are currently logged in as: <Text strong>{userRole.replace('_', ' ').toUpperCase()}</Text>
                </Paragraph>
              </div>
            )}
          </Space>
        </Card>
      </Container>
    </>
  );
};

export { ContactPage };
