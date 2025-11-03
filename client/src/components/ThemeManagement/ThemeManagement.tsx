/**
 * Theme Management Component
 * Allows admins to update site theme colors
 */

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Popconfirm,
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  BgColorsOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { useTheme } from 'hooks/useTheme';
import { ColorScheme } from 'configs/theme/colorScheme';
import './ThemeManagement.scss';

const { Title, Text } = Typography;

const ThemeManagement: React.FC = () => {
  const { colorScheme, updateAdminColorScheme, resetAdmin, defaultColorScheme } = useTheme();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Initialize form with current color scheme
  React.useEffect(() => {
    form.setFieldsValue({
      primary: colorScheme.primary,
      secondary: colorScheme.secondary,
      success: colorScheme.success,
      warning: colorScheme.warning,
      error: colorScheme.error,
      info: colorScheme.info,
      link: colorScheme.link,
      headerBackground: colorScheme.header.background,
      headerText: colorScheme.header.text,
      footerBackground: colorScheme.footer.background,
      footerText: colorScheme.footer.text,
      bannerBackground: colorScheme.banner.background,
      bannerOffer: colorScheme.banner.offer,
      bannerVoucher: colorScheme.banner.voucher,
      bannerFeatured: colorScheme.banner.featured,
      bannerFlashSale: colorScheme.banner.flashSale,
    });
  }, [colorScheme, form]);

  interface ThemeFormValues {
    primary?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
    link?: string;
    headerBackground?: string;
    headerText?: string;
    footerBackground?: string;
    footerText?: string;
    bannerBackground?: string;
    bannerOffer?: string;
    bannerVoucher?: string;
    bannerFeatured?: string;
    bannerFlashSale?: string;
  }

  const handleSave = async (values: ThemeFormValues) => {
    try {
      setSaving(true);

      // Update color scheme with proper fallbacks
      const updatedScheme: Partial<ColorScheme> = {
        primary: values.primary || colorScheme.primary,
        primaryLight: values.primary ? adjustColor(values.primary, 30) : undefined,
        primaryDark: values.primary ? adjustColor(values.primary, -30) : undefined,
        secondary: values.secondary || colorScheme.secondary,
        success: values.success || colorScheme.success,
        warning: values.warning || colorScheme.warning,
        error: values.error || colorScheme.error,
        info: values.info || colorScheme.info,
        link: values.link || colorScheme.link,
        header: {
          ...colorScheme.header,
          ...(values.headerBackground && { background: values.headerBackground }),
          ...(values.headerText && { text: values.headerText }),
        },
        footer: {
          ...colorScheme.footer,
          ...(values.footerBackground && { background: values.footerBackground }),
          ...(values.footerText && { text: values.footerText }),
        },
        banner: {
          ...colorScheme.banner,
          ...(values.bannerBackground && { background: values.bannerBackground }),
          ...(values.bannerOffer && { offer: values.bannerOffer }),
          ...(values.bannerVoucher && { voucher: values.bannerVoucher }),
          ...(values.bannerFeatured && { featured: values.bannerFeatured }),
          ...(values.bannerFlashSale && { flashSale: values.bannerFlashSale }),
        },
        button: {
          ...colorScheme.button,
          ...(values.primary && {
            primary: values.primary,
            primaryHover: adjustColor(values.primary, 30),
          }),
        },
      };

      updateAdminColorScheme(updatedScheme);
      message.success('Theme updated successfully! Changes will be visible immediately.');
    } catch (error: any) {
      message.error(error?.message || 'Failed to update theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    resetAdmin();
    form.setFieldsValue({
      primary: defaultColorScheme.primary,
      secondary: defaultColorScheme.secondary,
      success: defaultColorScheme.success,
      warning: defaultColorScheme.warning,
      error: defaultColorScheme.error,
      info: defaultColorScheme.info,
      link: defaultColorScheme.link,
      headerBackground: defaultColorScheme.header.background,
      headerText: defaultColorScheme.header.text,
      footerBackground: defaultColorScheme.footer.background,
      footerText: defaultColorScheme.footer.text,
      bannerBackground: defaultColorScheme.banner.background,
      bannerOffer: defaultColorScheme.banner.offer,
      bannerVoucher: defaultColorScheme.banner.voucher,
      bannerFeatured: defaultColorScheme.banner.featured,
      bannerFlashSale: defaultColorScheme.banner.flashSale,
    });
    message.success('Theme reset to default values');
  };

  // Helper function to adjust color brightness (percentage-based)
  const adjustColor = (color: string, percent: number): string => {
    if (!color || !color.startsWith('#')) {
      return color; // Return original if invalid
    }
    
    try {
      // Remove # and convert hex to RGB
      const hex = color.replace('#', '');
      if (hex.length !== 6) {
        return color; // Invalid hex, return original
      }
      
      const num = parseInt(hex, 16);
      if (isNaN(num)) {
        return color; // Invalid hex, return original
      }
      
      // Extract RGB components
      const r = (num >> 16) & 0xff;
      const g = (num >> 8) & 0xff;
      const b = num & 0xff;
      
      // Adjust brightness (percent can be positive or negative)
      const adjustR = Math.min(255, Math.max(0, r + percent));
      const adjustG = Math.min(255, Math.max(0, g + percent));
      const adjustB = Math.min(255, Math.max(0, b + percent));
      
      // Convert back to hex
      const newHex = ((adjustR << 16) | (adjustG << 8) | adjustB)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase();
      
      return `#${newHex}`;
    } catch (error) {
      console.error('Error adjusting color:', error);
      return color; // Return original on error
    }
  };

  return (
    <div className="theme-management">
      <Card>
        <div className="theme-header">
          <Space>
            <BgColorsOutlined style={{ fontSize: 24, color: colorScheme.primary }} />
            <div>
              <Title level={3} style={{ margin: 0 }}>Theme Management</Title>
              <Text type="secondary">Customize the site's color scheme and appearance</Text>
            </div>
          </Space>
          <Space>
            <Popconfirm
              title="Reset Theme"
              description="Are you sure you want to reset all theme colors to default values?"
              onConfirm={handleReset}
              okText="Yes, Reset"
              cancelText="Cancel"
            >
              <Button icon={<UndoOutlined />} danger>
                Reset to Default
              </Button>
            </Popconfirm>
          </Space>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="theme-form"
        >
          {/* Primary Colors */}
          <Card
            title="Primary Colors"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="primary"
                  label="Primary Color"
                  rules={[{ required: true, message: 'Please select primary color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="secondary"
                  label="Secondary Color"
                  rules={[{ required: true, message: 'Please select secondary color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="link"
                  label="Link Color"
                  rules={[{ required: true, message: 'Please select link color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Semantic Colors */}
          <Card
            title="Semantic Colors"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="success"
                  label="Success Color"
                  rules={[{ required: true, message: 'Please select success color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="warning"
                  label="Warning Color"
                  rules={[{ required: true, message: 'Please select warning color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="error"
                  label="Error Color"
                  rules={[{ required: true, message: 'Please select error color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  name="info"
                  label="Info Color"
                  rules={[{ required: true, message: 'Please select info color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Header Colors */}
          <Card
            title="Header Colors"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="headerBackground"
                  label="Header Background"
                  rules={[{ required: true, message: 'Please select header background' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="headerText"
                  label="Header Text Color"
                  rules={[{ required: true, message: 'Please select header text color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Footer Colors */}
          <Card
            title="Footer Colors"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="footerBackground"
                  label="Footer Background"
                  rules={[{ required: true, message: 'Please select footer background' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="footerText"
                  label="Footer Text Color"
                  rules={[{ required: true, message: 'Please select footer text color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Banner Colors */}
          <Card
            title="Banner Colors"
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="bannerBackground"
                  label="Default Banner Background"
                  rules={[{ required: true, message: 'Please select banner background' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="bannerOffer"
                  label="Offer Banner Color"
                  rules={[{ required: true, message: 'Please select offer banner color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="bannerVoucher"
                  label="Voucher Banner Color"
                  rules={[{ required: true, message: 'Please select voucher banner color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="bannerFeatured"
                  label="Featured Banner Color"
                  rules={[{ required: true, message: 'Please select featured banner color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  name="bannerFlashSale"
                  label="Flash Sale Banner Color"
                  rules={[{ required: true, message: 'Please select flash sale banner color' }]}
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                size="large"
              >
                Save Theme Changes
              </Button>
              <Button
                onClick={() => form.resetFields()}
                icon={<ReloadOutlined />}
              >
                Reset Form
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ThemeManagement;
