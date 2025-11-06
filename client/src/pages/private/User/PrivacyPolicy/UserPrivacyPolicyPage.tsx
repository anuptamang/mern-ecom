import { usePageTitle } from '@/hooks/usePageTitle';
import { Card, Typography, Space } from 'antd';
import { Container } from '@/components/UI';
import { useAppSelector } from '@/redux/store';
import { authSelector } from '@/redux/slice';
import styles from '@/assets/styles/Common.module.scss';

const { Title, Paragraph, Text } = Typography;

export const UserPrivacyPolicyPage = () => {
  const title = usePageTitle();
  const { result } = useAppSelector(authSelector);
  const userRole = result?.role;

  // Role-specific privacy policy sections (same as public but more detailed)
  const getRoleSpecificSections = () => {
    switch (userRole) {
      case 'seller':
        return [
          {
            title: 'Seller Information',
            content: 'We collect and store your seller profile information, including business details, bank payout information for secure transactions, product listings, and sales data. This information is used to process payments, manage your store, and facilitate transactions. Your bank payout information is encrypted and stored securely.',
          },
          {
            title: 'Product Data',
            content: 'Product information you provide, including images, descriptions, and pricing, may be displayed publicly. You are responsible for ensuring the accuracy and legality of your product listings. We may review product listings for compliance with our policies.',
          },
          {
            title: 'Order Information',
            content: 'We share buyer contact and delivery information with you to fulfill orders. You must protect this information and use it solely for order fulfillment purposes. Sharing buyer information with third parties without consent is prohibited.',
          },
          {
            title: 'Payment Information',
            content: 'Payment processing is handled securely through Stripe. Your bank payout information is stored encrypted and used only for seller payouts. We do not store your full bank account details.',
          },
        ];
      case 'delivery_agency':
      case 'delivery_person':
      case 'warehouse_operator':
        return [
          {
            title: 'Delivery Personnel Information',
            content: 'We collect and store your profile information, contact details, and delivery assignment data. This information is used to assign deliveries, coordinate logistics, and track delivery status. Your location data may be collected during active deliveries.',
          },
          {
            title: 'Customer Information Access',
            content: 'You may access customer delivery addresses and contact information only for the purpose of completing assigned deliveries. You must protect this information and use it solely for delivery purposes. Sharing customer information is strictly prohibited.',
          },
          {
            title: 'Location Data',
            content: 'Location data may be collected during delivery operations for tracking and coordination purposes. This data is used to optimize delivery routes and provide real-time tracking. Location data is retained only for the duration of active deliveries.',
          },
          {
            title: 'Delivery History',
            content: 'Your delivery history, including completed and pending deliveries, is maintained for performance tracking and dispute resolution. This information is accessible to delivery agencies and administrators.',
          },
        ];
      case 'support':
      case 'support_user':
        return [
          {
            title: 'Support Team Information',
            content: 'We collect and store your profile information and support assignment data. This information is used to assign return requests and manage support operations. Your actions and assignments are logged for accountability.',
          },
          {
            title: 'Customer Information Access',
            content: 'You may access customer information, order history, and return request details necessary to provide support services. All customer information must be handled with confidentiality. Unauthorized access or sharing of customer information is prohibited.',
          },
          {
            title: 'Return Processing',
            content: 'Return request information, including proof images and reasons, is accessible for processing returns. This information is used solely for return workflow management. All return data is protected and used only for processing purposes.',
          },
          {
            title: 'Communication Records',
            content: 'Communications with customers and other team members may be logged for quality assurance and training purposes. These records are maintained securely and accessed only for business purposes.',
          },
        ];
      case 'verification_team':
      case 'return_inspector':
        return [
          {
            title: 'Verification Team Information',
            content: 'We collect and store your profile information and inspection assignment data. This information is used to assign inspections and manage verification operations. Your inspection decisions are logged for accountability.',
          },
          {
            title: 'Return Inspection Data',
            content: 'You may access return request information, proof images, and package details for inspection purposes. All inspection findings must be documented accurately. Inspection decisions must be based solely on package condition and return policy compliance.',
          },
          {
            title: 'Quality Assurance',
            content: 'Inspection results and decisions are recorded and may be used for quality assurance purposes and dispute resolution. Inspection records are maintained securely and may be reviewed for quality control.',
          },
          {
            title: 'Decision Transparency',
            content: 'Your inspection decisions, including acceptance or rejection reasons, are shared with customers and support teams. All decisions must be fair, consistent, and in compliance with our return policy.',
          },
        ];
      case 'finance':
        return [
          {
            title: 'Finance Team Information',
            content: 'We collect and store your profile information for financial operations. This information is used to process refunds and manage financial transactions. All financial operations are logged for audit purposes.',
          },
          {
            title: 'Payment Information',
            content: 'You may access payment information and refund details necessary to process refunds securely. All payment information is handled according to PCI-DSS standards. Full credit card numbers are never stored or accessible.',
          },
          {
            title: 'Refund Processing',
            content: 'Refund transactions are processed securely through Stripe. Transaction records are maintained for accounting and audit purposes. All refund operations require proper authorization and are subject to review.',
          },
          {
            title: 'Financial Records',
            content: 'Financial records, including refund transactions and payment details, are maintained in compliance with financial regulations. These records are retained for the required period and are accessible only to authorized personnel.',
          },
        ];
      case 'admin':
        return [
          {
            title: 'Administrator Information',
            content: 'We collect and store your administrative profile information. This information is used for system administration and user management. All administrative actions are logged for security and audit purposes.',
          },
          {
            title: 'System Access',
            content: 'As an administrator, you have access to system-wide data for management purposes. All access and actions are logged for security and audit purposes. Unauthorized access or misuse of administrative privileges is strictly prohibited.',
          },
          {
            title: 'User Management',
            content: 'You may access user information for account management, password resets, and system administration. All user information must be handled with confidentiality. User data must be accessed only for legitimate business purposes.',
          },
          {
            title: 'System Configuration',
            content: 'You have access to system configurations and settings. All configuration changes are logged and may be reviewed. System changes that affect user data or security must be approved and documented.',
          },
        ];
      default:
        return [
          {
            title: 'Buyer Information',
            content: 'We collect and store your account information, including name, email, phone, and addresses for order processing and delivery. Payment information is processed securely through Stripe and is not stored on our servers. You can update your information at any time through your profile settings.',
          },
          {
            title: 'Order Information',
            content: 'Order details, including products purchased and delivery addresses, are shared with sellers and delivery personnel to fulfill your orders. This information is used solely for order fulfillment. Order history is maintained for your reference and customer support purposes.',
          },
          {
            title: 'Return Information',
            content: 'Return request information, including reasons and proof images, is shared with support teams, verification teams, and finance teams to process your returns and refunds. This information is used solely for return processing and is protected according to our privacy standards.',
          },
          {
            title: 'Payment Security',
            content: 'All payments are processed securely through Stripe. We do not store your full credit card information. Payment details are encrypted during transmission and processing. Your payment history is maintained for your reference and dispute resolution.',
          },
        ];
    }
  };

  const roleSections = getRoleSpecificSections();

  return (
    <>
      {title}
      <Container className={styles.pageContainer}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Title level={2}>Privacy Policy</Title>
            <Paragraph>
              <Text strong>Last Updated:</Text> January 2025
            </Paragraph>
            <Paragraph>
              This Privacy Policy describes how we collect, use, and protect your information when you use our platform.
              This policy is tailored for your role: <Text strong>{userRole?.replace('_', ' ').toUpperCase() || 'USER'}</Text>
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
              over the Internet is 100% secure. We regularly review and update our security practices.
            </Paragraph>
          </Card>

          <Card>
            <Title level={3}>Your Rights</Title>
            <Paragraph>
              You have the right to access, update, or delete your account information at any time through your
              profile settings. You can also request a copy of your data or request deletion of your account.
              For additional privacy requests, please contact our support team.
            </Paragraph>
          </Card>

          <Card>
            <Title level={3}>Changes to This Policy</Title>
            <Paragraph>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting
              the new Privacy Policy on this page and updating the "Last Updated" date. Continued use of our
              platform after changes constitutes acceptance of the updated policy.
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
