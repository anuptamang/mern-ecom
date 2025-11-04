/**
 * Theme Management Component
 * Allows admins to update site theme colors
 */

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Popconfirm,
  Upload,
  Image,
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  BgColorsOutlined,
  UndoOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd';
import axios from 'axios';
import { getToken } from 'utils/localStorage';
import { BACKEND_API } from 'configs/api/api';
import { useTheme } from 'hooks/useTheme';
import { ColorScheme } from 'configs/theme/colorScheme';
import { updateThemeApi, resetThemeApi } from 'services/endPoints/theme/themeEndpoints';
import './ThemeManagement.scss';

const { Title, Text } = Typography;

const ThemeManagement: React.FC = () => {
  const { colorScheme, updateAdminColorScheme, resetAdmin, defaultColorScheme } = useTheme();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<UploadFile | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
      // Navigation menu colors
      navItemColor: colorScheme.nav?.itemColor,
      navItemHoverColor: colorScheme.nav?.itemHoverColor,
      navItemActiveColor: colorScheme.nav?.itemActiveColor,
      navItemActiveBg: colorScheme.nav?.itemActiveBg,
      // Button colors
      buttonPrimary: colorScheme.button?.primary,
      buttonPrimaryHover: colorScheme.button?.primaryHover,
      buttonSecondary: colorScheme.button?.secondary,
      buttonDanger: colorScheme.button?.danger,
      // Logo configuration
      logoText: colorScheme.logo?.text || '',
      logoIconColor: colorScheme.logo?.iconColor,
      logoTextColor: colorScheme.logo?.textColor,
      // Body text configuration
      bodyFontFamily: colorScheme.bodyText?.fontFamily,
      bodyFontSize: colorScheme.bodyText?.fontSize,
      bodyLineHeight: colorScheme.bodyText?.lineHeight,
      bodyColor: colorScheme.bodyText?.color,
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
    // Navigation colors
    navItemColor?: string;
    navItemHoverColor?: string;
    navItemActiveColor?: string;
    navItemActiveBg?: string;
    // Logo configuration
    logoImageUrl?: string;
    logoText?: string;
    logoIconColor?: string;
    logoTextColor?: string;
    // Body text configuration
    bodyFontFamily?: string;
    bodyFontSize?: number;
    bodyLineHeight?: number;
    bodyColor?: string;
    // Button colors
    buttonPrimary?: string;
    buttonPrimaryHover?: string;
    buttonSecondary?: string;
    buttonDanger?: string;
  }

  // Initialize logo preview when component mounts or colorScheme changes
  React.useEffect(() => {
    if (colorScheme.logo?.imageUrl && !logoFile) {
      setLogoPreview(colorScheme.logo.imageUrl);
    }
  }, [colorScheme.logo?.imageUrl, logoFile]);

  const handleLogoFileChange = (info: any) => {
    const { fileList } = info;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      setLogoFile(file);
      // Create preview URL
      if (file.originFileObj) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file.originFileObj);
      } else if (file.url || file.thumbUrl) {
        // Use existing URL if file already has one
        setLogoPreview(file.url || file.thumbUrl);
      }
    } else {
      setLogoFile(null);
      setLogoPreview(colorScheme.logo?.imageUrl || null);
    }
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleLogoUpload = async (file: File): Promise<string> => {
    const token = getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('logo', file);

    const response = await axios.post(
      `${BACKEND_API}/theme/upload-logo`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.data.success && response.data.data?.logoUrl) {
      return response.data.data.logoUrl;
    }
    throw new Error('Failed to upload logo');
  };

  const handleSave = async (values: ThemeFormValues) => {
    try {
      setSaving(true);

      let logoImageUrl = colorScheme.logo?.imageUrl || null;

      // Upload logo file if provided
      if (logoFile && logoFile.originFileObj) {
        try {
          logoImageUrl = await handleLogoUpload(logoFile.originFileObj);
          message.success('Logo uploaded successfully');
        } catch (uploadError: any) {
          message.error(uploadError?.response?.data?.message || uploadError?.message || 'Failed to upload logo. Using previous logo.');
          // Keep existing logo URL on error
        }
      }

      // Update color scheme with proper fallbacks - use defaults if fields are empty
      const updatedScheme: Partial<ColorScheme> = {
        primary: values.primary || colorScheme.primary || defaultColorScheme.primary,
        primaryLight: values.primary ? adjustColor(values.primary, 30) : (colorScheme.primaryLight || defaultColorScheme.primaryLight),
        primaryDark: values.primary ? adjustColor(values.primary, -30) : (colorScheme.primaryDark || defaultColorScheme.primaryDark),
        secondary: values.secondary || colorScheme.secondary || defaultColorScheme.secondary,
        success: values.success || colorScheme.success || defaultColorScheme.success,
        warning: values.warning || colorScheme.warning || defaultColorScheme.warning,
        error: values.error || colorScheme.error || defaultColorScheme.error,
        info: values.info || colorScheme.info || defaultColorScheme.info,
        link: values.link || colorScheme.link || defaultColorScheme.link,
        header: {
          background: values.headerBackground || colorScheme.header.background || defaultColorScheme.header.background,
          text: values.headerText || colorScheme.header.text || defaultColorScheme.header.text,
          border: colorScheme.header.border || defaultColorScheme.header.border,
          backgroundGradient: colorScheme.header.backgroundGradient || defaultColorScheme.header.backgroundGradient,
        },
        footer: {
          background: values.footerBackground || colorScheme.footer.background || defaultColorScheme.footer.background,
          text: values.footerText || colorScheme.footer.text || defaultColorScheme.footer.text,
          textSecondary: colorScheme.footer.textSecondary || defaultColorScheme.footer.textSecondary,
          border: colorScheme.footer.border || defaultColorScheme.footer.border,
        },
        banner: {
          background: values.bannerBackground || colorScheme.banner.background || defaultColorScheme.banner.background,
          offer: values.bannerOffer || colorScheme.banner.offer || defaultColorScheme.banner.offer,
          voucher: values.bannerVoucher || colorScheme.banner.voucher || defaultColorScheme.banner.voucher,
          featured: values.bannerFeatured || colorScheme.banner.featured || defaultColorScheme.banner.featured,
          flashSale: values.bannerFlashSale || colorScheme.banner.flashSale || defaultColorScheme.banner.flashSale,
          text: colorScheme.banner.text || defaultColorScheme.banner.text,
          comingSoon: colorScheme.banner.comingSoon || defaultColorScheme.banner.comingSoon,
        },
        button: {
          primary: values.buttonPrimary || colorScheme.button.primary || defaultColorScheme.button.primary,
          primaryHover: values.buttonPrimaryHover || (values.buttonPrimary ? adjustColor(values.buttonPrimary, 30) : undefined) || colorScheme.button.primaryHover || defaultColorScheme.button.primaryHover,
          secondary: values.buttonSecondary || colorScheme.button.secondary || defaultColorScheme.button.secondary,
          danger: values.buttonDanger || colorScheme.button.danger || defaultColorScheme.button.danger,
          secondaryHover: colorScheme.button.secondaryHover || defaultColorScheme.button.secondaryHover,
          dangerHover: colorScheme.button.dangerHover || defaultColorScheme.button.dangerHover,
        },
        nav: {
          itemColor: values.navItemColor || colorScheme.nav.itemColor || defaultColorScheme.nav.itemColor,
          itemHoverColor: values.navItemHoverColor || colorScheme.nav.itemHoverColor || defaultColorScheme.nav.itemHoverColor,
          itemActiveColor: values.navItemActiveColor || colorScheme.nav.itemActiveColor || defaultColorScheme.nav.itemActiveColor,
          itemActiveBg: values.navItemActiveBg || colorScheme.nav.itemActiveBg || defaultColorScheme.nav.itemActiveBg,
        },
        logo: {
          imageUrl: logoImageUrl !== undefined ? logoImageUrl : (colorScheme.logo?.imageUrl || defaultColorScheme.logo.imageUrl),
          text: values.logoText !== undefined ? (values.logoText || null) : (colorScheme.logo.text || defaultColorScheme.logo.text),
          iconColor: values.logoIconColor || colorScheme.logo.iconColor || defaultColorScheme.logo.iconColor,
          textColor: values.logoTextColor || colorScheme.logo.textColor || defaultColorScheme.logo.textColor,
        },
        bodyText: {
          fontFamily: values.bodyFontFamily || colorScheme.bodyText.fontFamily || defaultColorScheme.bodyText.fontFamily,
          fontSize: values.bodyFontSize || colorScheme.bodyText.fontSize || defaultColorScheme.bodyText.fontSize,
          lineHeight: values.bodyLineHeight || colorScheme.bodyText.lineHeight || defaultColorScheme.bodyText.lineHeight,
          color: values.bodyColor || colorScheme.bodyText.color || defaultColorScheme.bodyText.color,
        },
      };

      // Save to database (site-wide theme)
      try {
        await updateThemeApi(updatedScheme);
        
        // Also update local state for immediate UI update
        updateAdminColorScheme(updatedScheme);
        
        // Clear cache to force refresh from API
        localStorage.removeItem('siteTheme');
        localStorage.removeItem('siteThemeTime');
        
        // Reload theme from API
        window.location.reload(); // Force full reload to apply theme to all components
        
        message.success('Theme updated successfully! Changes apply to all users.');
      } catch (apiError: any) {
        // Fallback to localStorage if API fails
        updateAdminColorScheme(updatedScheme);
        message.warning('Theme updated locally. API save failed. Please check your connection.');
      }
    } catch (error: any) {
      message.error(error?.message || 'Failed to update theme');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      // Reset in database
      await resetThemeApi();
      
      // Clear cache
      localStorage.removeItem('siteTheme');
      localStorage.removeItem('siteThemeTime');
      localStorage.removeItem('adminColorScheme');
      
      // Reset local state
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
        navItemColor: defaultColorScheme.nav.itemColor,
        navItemHoverColor: defaultColorScheme.nav.itemHoverColor,
        navItemActiveColor: defaultColorScheme.nav.itemActiveColor,
        navItemActiveBg: defaultColorScheme.nav.itemActiveBg,
        logoImageUrl: defaultColorScheme.logo.imageUrl || '',
        logoText: defaultColorScheme.logo.text || '',
        logoIconColor: defaultColorScheme.logo.iconColor,
        logoTextColor: defaultColorScheme.logo.textColor,
        bodyFontFamily: defaultColorScheme.bodyText.fontFamily,
        bodyFontSize: defaultColorScheme.bodyText.fontSize,
        bodyLineHeight: defaultColorScheme.bodyText.lineHeight,
        bodyColor: defaultColorScheme.bodyText.color,
        buttonPrimary: defaultColorScheme.button.primary,
        buttonPrimaryHover: defaultColorScheme.button.primaryHover,
        buttonSecondary: defaultColorScheme.button.secondary,
        buttonDanger: defaultColorScheme.button.danger,
      });
      
      // Reload to apply reset theme
      window.location.reload();
      
      message.success('Theme reset to default values. Refreshing...');
    } catch (apiError: any) {
      // Fallback to local reset
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
        navItemColor: defaultColorScheme.nav.itemColor,
        navItemHoverColor: defaultColorScheme.nav.itemHoverColor,
        navItemActiveColor: defaultColorScheme.nav.itemActiveColor,
        navItemActiveBg: defaultColorScheme.nav.itemActiveBg,
        logoImageUrl: defaultColorScheme.logo.imageUrl || '',
        logoText: defaultColorScheme.logo.text || '',
        logoIconColor: defaultColorScheme.logo.iconColor,
        logoTextColor: defaultColorScheme.logo.textColor,
        bodyFontFamily: defaultColorScheme.bodyText.fontFamily,
        bodyFontSize: defaultColorScheme.bodyText.fontSize,
        bodyLineHeight: defaultColorScheme.bodyText.lineHeight,
        bodyColor: defaultColorScheme.bodyText.color,
        buttonPrimary: defaultColorScheme.button.primary,
        buttonPrimaryHover: defaultColorScheme.button.primaryHover,
        buttonSecondary: defaultColorScheme.button.secondary,
        buttonDanger: defaultColorScheme.button.danger,
      });
      message.warning('Theme reset locally. API reset failed.');
    }
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
                  label="Primary Color (optional)"
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
                  label="Secondary Color (optional)"
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
                  label="Link Color (optional)"
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
                  label="Success Color (optional)"
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
                  label="Warning Color (optional)"
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
                  label="Error Color (optional)"
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
                  label="Info Color (optional)"
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
                  label="Header Background (optional)"
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
                  label="Header Text Color (optional)"
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
                  label="Footer Background (optional)"
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
                  label="Footer Text Color (optional)"
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
                  label="Default Banner Background (optional)"
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
                  label="Offer Banner Color (optional)"
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
                  label="Voucher Banner Color (optional)"
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
                  label="Featured Banner Color (optional)"
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
                  label="Flash Sale Banner Color (optional)"
                >
                  <Input
                    type="color"
                    style={{ width: '100%', height: 40 }}
                  />
                </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Navigation Colors */}
              <Card
                title="Navigation Menu Colors"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="navItemColor"
                      label="Menu Item Color (optional)"
                    >
                      <Input
                        type="color"
                        style={{ width: '100%', height: 40 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="navItemHoverColor"
                      label="Menu Item Hover Color (optional)"
                    >
                      <Input
                        type="color"
                        style={{ width: '100%', height: 40 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="navItemActiveColor"
                      label="Active Item Color (optional)"
                    >
                      <Input
                        type="color"
                        style={{ width: '100%', height: 40 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="navItemActiveBg"
                      label="Active Item Background (optional)"
                    >
                      <Input
                        type="color"
                        style={{ width: '100%', height: 40 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Button Colors */}
              <Card
                title="Button Colors"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="buttonPrimary"
                      label="Primary Button Color (optional)"
                    >
                      <Input
                        type="color"
                        style={{ width: '100%', height: 40 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="buttonPrimaryHover"
                      label="Primary Button Hover (optional)"
                    >
                      <Input
                        type="color"
                        style={{ width: '100%', height: 40 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="buttonSecondary"
                      label="Secondary Button Color (optional)"
                    >
                      <Input
                        type="color"
                        style={{ width: '100%', height: 40 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item
                      name="buttonDanger"
                      label="Danger Button Color (optional)"
                    >
                      <Input
                        type="color"
                        style={{ width: '100%', height: 40 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Logo Configuration */}
              <Card
                title="Logo Configuration"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Form.Item
                      label="Logo Image (optional - leave empty to use default icon)"
                      tooltip="Upload a logo image file or leave empty to use the default icon"
                    >
                      <Upload
                        accept="image/*"
                        beforeUpload={() => false}
                        onChange={handleLogoFileChange}
                        onRemove={handleLogoRemove}
                        maxCount={1}
                        fileList={logoFile ? [logoFile] : []}
                        listType="picture-card"
                      >
                        {!logoFile && (
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Upload Logo</div>
                          </div>
                        )}
                      </Upload>
                      {logoPreview && (
                        <div style={{ marginTop: 16 }}>
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            style={{ maxWidth: 200, maxHeight: 100, objectFit: 'contain' }}
                          />
                          {logoFile && (
                            <Button
                              type="link"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={handleLogoRemove}
                              style={{ marginTop: 8 }}
                            >
                              Remove Logo
                            </Button>
                          )}
                        </div>
                      )}
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="logoText"
                      label="Logo Text (leave empty to use site title)"
                      tooltip="Custom text for logo, or leave empty to use site title"
                    >
                      <Input
                        placeholder="Leave empty for default"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="logoIconColor"
                      label="Logo Icon Color (optional)"
                    >
                      <Input
                        type="color"
                        style={{ width: '100%', height: 40 }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="logoTextColor"
                      label="Logo Text Color (optional)"
                    >
                      <Input
                        type="color"
                        style={{ width: '100%', height: 40 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Body Text Configuration */}
              <Card
                title="Body Text Appearance"
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="bodyFontFamily"
                      label="Font Family (optional)"
                    >
                      <Input
                        placeholder="Mulish, sans-serif"
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Form.Item
                      name="bodyFontSize"
                      label="Font Size (px) (optional)"
                    >
                      <InputNumber
                        min={10}
                        max={24}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={6}>
                    <Form.Item
                      name="bodyLineHeight"
                      label="Line Height (optional)"
                    >
                      <InputNumber
                        min={1}
                        max={2}
                        step={0.1}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="bodyColor"
                      label="Text Color (optional)"
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
