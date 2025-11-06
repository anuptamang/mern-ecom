'use client';

import { Container } from '@/components/UI';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ReactNode } from 'react';
import styles from '@/assets/styles/Common.module.scss';
import { Card, Typography, Space, Divider, List } from 'antd';
import { ShoppingOutlined, ShopOutlined, CarOutlined, TeamOutlined, BankOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';

const { Title, Paragraph, Text } = Typography;

export const AboutPage = () => {
  const title: ReactNode = usePageTitle();
  const { result } = useAppSelector(authSelector);
  const userRole = result?.role;

  // Role-specific about content
  const getRoleSpecificContent = () => {
    switch (userRole) {
      case 'seller':
        return {
          title: 'About Seller Platform',
          description: 'As a seller on our platform, you have access to powerful tools to manage your online store.',
          features: [
            'Create and manage product listings with images and descriptions',
            'Track orders and mark items as ready to ship',
            'Manage inventory and stock levels',
            'View sales analytics and reports',
            'Secure payment processing with bank payout information',
            'Communicate with buyers through our messaging system',
          ],
          benefits: [
            'Reach thousands of customers',
            'Easy-to-use seller dashboard',
            'Real-time order tracking',
            'Secure payment processing',
          ],
        };
      case 'delivery_agency':
        return {
          title: 'About Delivery Agency Platform',
          description: 'Manage your delivery operations efficiently with our comprehensive delivery management system.',
          features: [
            'View and manage customer deliveries',
            'View and manage return deliveries',
            'Assign warehouse operators and delivery personnel',
            'Track delivery status in real-time',
            'Coordinate between warehouse, operators, and deliverers',
            'Manage delivery assignments for customer orders and returns',
          ],
          benefits: [
            'Streamlined delivery operations',
            'Real-time tracking and coordination',
            'Efficient resource allocation',
            'Complete visibility into delivery workflow',
          ],
        };
      case 'delivery_person':
        return {
          title: 'About Delivery Personnel Platform',
          description: 'As a delivery person, manage your deliveries efficiently with our delivery tracking system.',
          features: [
            'View assigned deliveries based on your deliverer type',
            'Update delivery status in real-time',
            'Handle customer deliveries (warehouse or customer delivery types)',
            'Handle return pickups and re-deliveries (return deliverer type)',
            'Mark deliveries as completed or handle rejections',
            'Track delivery history',
          ],
          benefits: [
            'Easy-to-use delivery dashboard',
            'Clear delivery assignments',
            'Real-time status updates',
            'Complete delivery history',
          ],
        };
      case 'warehouse_operator':
        return {
          title: 'About Warehouse Operator Platform',
          description: 'Manage orders within the delivery facility and coordinate with customer deliverers.',
          features: [
            'View orders in the delivery facility',
            'Assign customer delivery deliverers',
            'Update delivery status (in_facility → in_transit → out_for_delivery)',
            'Coordinate order processing within facility',
            'Track order history',
          ],
          benefits: [
            'Efficient facility management',
            'Clear assignment workflow',
            'Real-time status tracking',
            'Streamlined operations',
          ],
        };
      case 'support':
      case 'support_user':
        return {
          title: 'About Support Team Platform',
          description: 'Manage customer returns and coordinate the return workflow efficiently.',
          features: [
            'View and assign return requests',
            'Assign delivery agencies for return pickups',
            'Assign verification teams for inspection',
            'Assign finance teams for refund processing',
            'Coordinate return workflow from start to finish',
            'Manage return status and tracking',
          ],
          benefits: [
            'Complete return visibility',
            'Efficient workflow management',
            'Streamlined coordination',
            'Customer satisfaction focus',
          ],
        };
      case 'verification_team':
        return {
          title: 'About Verification Team Platform',
          description: 'Manage return inspections and assign inspectors for quality verification.',
          features: [
            'View returns in inspection queue',
            'Assign return inspectors',
            'Track inspection status',
            'Coordinate inspection workflow',
          ],
          benefits: [
            'Quality assurance',
            'Efficient inspection workflow',
            'Clear assignment process',
            'Complete tracking',
          ],
        };
      case 'return_inspector':
        return {
          title: 'About Inspector Platform',
          description: 'Inspect return packages and make accept/reject decisions based on quality checks.',
          features: [
            'View assigned return inspections',
            'Inspect return packages',
            'Accept or reject returns with detailed reasons',
            'Upload inspection notes and documentation',
            'Track inspection history',
          ],
          benefits: [
            'Quality control',
            'Detailed inspection process',
            'Clear decision workflow',
            'Complete documentation',
          ],
        };
      case 'finance':
        return {
          title: 'About Finance Platform',
          description: 'Process refunds securely and manage financial transactions for returns.',
          features: [
            'View returns pending refund',
            'Process refunds via Stripe',
            'Track refund status',
            'View refund history',
            'Manage financial transactions',
          ],
          benefits: [
            'Secure payment processing',
            'Complete refund visibility',
            'Efficient processing',
            'Financial tracking',
          ],
        };
      case 'admin':
        return {
          title: 'About Admin Platform',
          description: 'Manage the entire platform, users, and system operations.',
          features: [
            'Create and manage delivery agencies',
            'Create and manage support admins',
            'Create and manage finance users',
            'Reset passwords for child users',
            'View platform-wide statistics',
            'Manage system configurations',
          ],
          benefits: [
            'Complete platform control',
            'User management',
            'System oversight',
            'Security management',
          ],
        };
      default:
        return {
          title: 'About Our Platform',
          description: 'Welcome to our comprehensive e-commerce platform designed to provide a seamless shopping experience.',
          features: [
            'Browse thousands of products across multiple categories',
            'Secure shopping cart with persistent storage',
            'Safe and secure checkout with Stripe payment processing',
            'Real-time order tracking from purchase to delivery',
            'Easy return and refund process',
            'Direct messaging with sellers',
            'Wishlist management',
            'Order history and tracking',
          ],
          benefits: [
            'Secure payment processing',
            'Fast and reliable delivery',
            'Easy returns and refunds',
            '24/7 customer support',
          ],
        };
    }
  };

  const content = getRoleSpecificContent();

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Title level={2}>{content.title}</Title>
            <Paragraph>{content.description}</Paragraph>
          </Card>

          <Card>
            <Title level={3}>Key Features</Title>
            <List
              dataSource={content.features}
              renderItem={(item) => (
                <List.Item>
                  <Text>• {item}</Text>
                </List.Item>
              )}
            />
          </Card>

          <Card>
            <Title level={3}>Benefits</Title>
            <List
              dataSource={content.benefits}
              renderItem={(item) => (
                <List.Item>
                  <Text>• {item}</Text>
                </List.Item>
              )}
            />
          </Card>

          {!userRole && (
            <Card>
              <Title level={3}>For All Users</Title>
              <Paragraph>
                Our platform serves multiple user types, each with tailored features:
              </Paragraph>
              <List
                dataSource={[
                  { icon: <ShoppingOutlined />, text: 'Buyers - Shop and purchase products' },
                  { icon: <ShopOutlined />, text: 'Sellers - Manage your online store' },
                  { icon: <CarOutlined />, text: 'Delivery Agencies - Manage delivery operations' },
                  { icon: <TeamOutlined />, text: 'Support Teams - Handle returns and customer service' },
                  { icon: <SafetyOutlined />, text: 'Verification Teams - Quality assurance' },
                  { icon: <BankOutlined />, text: 'Finance Teams - Process refunds securely' },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      {item.icon}
                      <Text>{item.text}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          {userRole && (
            <Card>
              <Title level={3}>Your Role</Title>
              <Paragraph>
                You are currently logged in as: <Text strong>{userRole.replace('_', ' ').toUpperCase()}</Text>
              </Paragraph>
            </Card>
          )}
        </Space>
      </Container>
    </>
  );
};
