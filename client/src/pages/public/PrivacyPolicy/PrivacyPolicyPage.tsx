'use client';

import { Container } from '@/components/UI';
import { Helmet } from 'react-helmet-async';
import { Card, Typography, Space, Divider } from 'antd';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';
import styles from '@/assets/styles/Common.module.scss';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicyPage = () => {
  const { result } = useAppSelector(authSelector);
  const userRole = result?.role;

  // Role-specific privacy policy sections
  const getRoleSpecificSections = () => {
    switch (userRole) {
      case 'seller':
        return [
          {
            title: 'Seller Information',
            content: 'We collect and store your seller profile information, including business details, bank payout information for secure transactions, product listings, and sales data. This information is used to process payments, manage your store, and facilitate transactions.',
          },
          {
            title: 'Product Data',
            content: 'Product information you provide, including images, descriptions, and pricing, may be displayed publicly. You are responsible for ensuring the accuracy and legality of your product listings.',
          },
          {
            title: 'Order Information',
            content: 'We share buyer contact and delivery information with you to fulfill orders. You must protect this information and use it solely for order fulfillment purposes.',
          },
        ];
      case 'delivery_agency':
      case 'delivery_person':
      case 'warehouse_operator':
        return [
          {
            title: 'Delivery Personnel Information',
            content: 'We collect and store your profile information, contact details, and delivery assignment data. This information is used to assign deliveries, coordinate logistics, and track delivery status.',
          },
          {
            title: 'Customer Information Access',
            content: 'You may access customer delivery addresses and contact information only for the purpose of completing assigned deliveries. You must protect this information and use it solely for delivery purposes.',
          },
          {
            title: 'Location Data',
            content: 'Location data may be collected during delivery operations for tracking and coordination purposes. This data is used to optimize delivery routes and provide real-time tracking.',
          },
        ];
      case 'support':
      case 'support_user':
        return [
          {
            title: 'Support Team Information',
            content: 'We collect and store your profile information and support assignment data. This information is used to assign return requests and manage support operations.',
          },
          {
            title: 'Customer Information Access',
            content: 'You may access customer information, order history, and return request details necessary to provide support services. All customer information must be handled with confidentiality.',
          },
          {
            title: 'Return Processing',
            content: 'Return request information, including proof images and reasons, is accessible for processing returns. This information is used solely for return workflow management.',
          },
        ];
      case 'verification_team':
      case 'return_inspector':
        return [
          {
            title: 'Verification Team Information',
            content: 'We collect and store your profile information and inspection assignment data. This information is used to assign inspections and manage verification operations.',
          },
          {
            title: 'Return Inspection Data',
            content: 'You may access return request information, proof images, and package details for inspection purposes. All inspection findings must be documented accurately.',
          },
          {
            title: 'Quality Assurance',
            content: 'Inspection results and decisions are recorded and may be used for quality assurance purposes and dispute resolution.',
          },
        ];
      case 'finance':
        return [
          {
            title: 'Finance Team Information',
            content: 'We collect and store your profile information for financial operations. This information is used to process refunds and manage financial transactions.',
          },
          {
            title: 'Payment Information',
            content: 'You may access payment information and refund details necessary to process refunds securely. All payment information is handled according to PCI-DSS standards.',
          },
          {
            title: 'Refund Processing',
            content: 'Refund transactions are processed securely through Stripe. Transaction records are maintained for accounting and audit purposes.',
          },
        ];
      case 'admin':
        return [
          {
            title: 'Administrator Information',
            content: 'We collect and store your administrative profile information. This information is used for system administration and user management.',
          },
          {
            title: 'System Access',
            content: 'As an administrator, you have access to system-wide data for management purposes. All access and actions are logged for security and audit purposes.',
          },
          {
            title: 'User Management',
            content: 'You may access user information for account management, password resets, and system administration. All user information must be handled with confidentiality.',
          },
        ];
      default:
        return [
          {
            title: 'Buyer Information',
            content: 'We collect and store your account information, including name, email, phone, and addresses for order processing and delivery. Payment information is processed securely through Stripe and is not stored on our servers.',
          },
          {
            title: 'Order Information',
            content: 'Order details, including products purchased and delivery addresses, are shared with sellers and delivery personnel to fulfill your orders. This information is used solely for order fulfillment.',
          },
          {
            title: 'Return Information',
            content: 'Return request information, including reasons and proof images, is shared with support teams, verification teams, and finance teams to process your returns and refunds.',
          },
        ];
    }
  };

  const roleSections = getRoleSpecificSections();

  return (
    <>
      <Helmet>
        <title>Privacy Policy | E-Commerce Platform</title>
      </Helmet>
      <Container className={styles.pageContainer}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Title level={2}>Privacy Policy</Title>
            <Paragraph>
              <Text strong>Last Updated:</Text> January 2025
            </Paragraph>
            <Paragraph>
              This Privacy Policy describes how we collect, use, and protect your information when you use our platform.
              {userRole && (
                <Text> This policy is tailored for your role: <Text strong>{userRole.replace('_', ' ').toUpperCase()}</Text></Text>
              )}
            </Paragraph>
          </Card>

          {roleSections.map((section, index) => (
            <Card key={index}>
              <Title level={3}>{section.title}</Title>
              <Paragraph>{section.content}</Paragraph>
            </Card>
          ))}

          <Card>
            <Title level={3}>Data Security</Title>
            <Paragraph>
              We implement industry-standard security measures to protect your information, including encryption,
              secure payment processing through Stripe, and access controls. However, no method of transmission
              over the Internet is 100% secure.
            </Paragraph>
          </Card>

          <Card>
            <Title level={3}>Your Rights</Title>
            <Paragraph>
              You have the right to access, update, or delete your account information at any time through your
              profile settings. For additional privacy requests, please contact our support team.
            </Paragraph>
          </Card>

          <Card>
            <Title level={3}>Changes to This Policy</Title>
            <Paragraph>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting
              the new Privacy Policy on this page and updating the "Last Updated" date.
            </Paragraph>
          </Card>

          <Card>
            <Title level={3}>Contact Us</Title>
            <Paragraph>
              If you have questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:privacy@ecommerce.com">privacy@ecommerce.com</a>
            </Paragraph>
          </Card>
        </Space>
      </Container>
    </>
  );
};

export { PrivacyPolicyPage };
