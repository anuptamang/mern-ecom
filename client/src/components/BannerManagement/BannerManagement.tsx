import React, { useEffect, useState } from 'react';
import {
  Card,
  List,
  Button,
  message,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Switch,
  InputNumber,
  Popconfirm,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DragOutlined,
} from '@ant-design/icons';
import {
  getBannerSlidesApi,
  createBannerSlideApi,
  updateBannerSlideApi,
  deleteBannerSlideApi,
  reorderBannerSlidesApi,
  BannerSlide,
} from 'services/endPoints/banner';
import { BANNER_CONFIG } from '../../constants/banner';
import { LABELS, MESSAGES } from '../../constants';
import './BannerManagement.scss';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const BannerManagement: React.FC = () => {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSlide, setEditingSlide] = useState<BannerSlide | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBannerSlides();
  }, []);

  const loadBannerSlides = async () => {
    try {
      setLoading(true);
      const { data } = await getBannerSlidesApi();
      setSlides(data.slides || []);
    } catch (error: any) {
      message.error(error?.response?.data?.message || MESSAGES.ERROR.GENERIC_ERROR('load banner slides'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSlide(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (slide: BannerSlide) => {
    setEditingSlide(slide);
    form.setFieldsValue({
      ...slide,
      backgroundColor: slide.backgroundColor || BANNER_CONFIG.COLORS.DEFAULT_BACKGROUND,
      textColor: slide.textColor || BANNER_CONFIG.COLORS.DEFAULT_TEXT,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBannerSlideApi(id);
      message.success('Banner slide deleted successfully');
      loadBannerSlides();
    } catch (error: any) {
      message.error(error?.response?.data?.message || MESSAGES.ERROR.GENERIC_ERROR('delete banner slide'));
    }
  };

  const handleToggleActive = async (slide: BannerSlide) => {
    try {
      await updateBannerSlideApi(slide.id, { isActive: !slide.isActive });
      message.success(`Banner slide ${slide.isActive ? 'deactivated' : 'activated'} successfully`);
      loadBannerSlides();
    } catch (error: any) {
      message.error(error?.response?.data?.message || MESSAGES.ERROR.GENERIC_ERROR('update banner slide'));
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingSlide) {
        await updateBannerSlideApi(editingSlide.id, values);
        message.success('Banner slide updated successfully');
      } else {
        await createBannerSlideApi(values);
        message.success('Banner slide created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      loadBannerSlides();
    } catch (error: any) {
      message.error(error?.response?.data?.message || MESSAGES.ERROR.GENERIC_ERROR('save banner slide'));
    }
  };

  const getSlideTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      offer: 'red',
      voucher: 'green',
      'coming-soon': 'orange',
      featured: 'blue',
      banner: 'purple',
      'flash-sale': 'volcano',
    };
    return colors[type] || 'default';
  };

  return (
    <div className="banner-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2>Banner Management</h2>
            <p style={{ color: 'var(--theme-text-secondary, #666)' }}>Manage hero banner slides, offers, vouchers, and promotions</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Add Banner Slide
          </Button>
        </div>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Spin spinning={loading}>
          {slides.length === 0 ? (
            <Empty description="No banner slides found. Create your first slide!" />
          ) : (
            <List
              dataSource={slides}
              renderItem={(slide) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          backgroundColor: slide.backgroundColor || BANNER_CONFIG.COLORS.DEFAULT_BACKGROUND,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: slide.textColor || BANNER_CONFIG.COLORS.DEFAULT_TEXT,
                          fontWeight: 'bold',
                          fontSize: 12,
                        }}
                      >
                        {slide.type.charAt(0).toUpperCase()}
                      </div>
                    }
                    title={
                      <Space>
                        <span>{slide.title}</span>
                        <Tag color={getSlideTypeColor(slide.type)}>{slide.type}</Tag>
                        {!slide.isActive && <Tag color="default">Inactive</Tag>}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small">
                        {slide.subtitle && <Text type="secondary">{slide.subtitle}</Text>}
                        {slide.description && <Text type="secondary">{slide.description}</Text>}
                        <Text type="secondary">Order: {slide.order || 0}</Text>
                      </Space>
                    }
                  />
                  <Space>
                    <Switch
                      checked={slide.isActive}
                      onChange={() => handleToggleActive(slide)}
                      checkedChildren={<EyeOutlined />}
                      unCheckedChildren={<EyeInvisibleOutlined />}
                    />
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(slide)}
                      size="small"
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Are you sure you want to delete this banner slide?"
                      onConfirm={() => handleDelete(slide.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>

      <Modal
        title={editingSlide ? 'Edit Banner Slide' : 'Create Banner Slide'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingSlide(null);
        }}
        okText={editingSlide ? 'Update' : 'Create'}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'banner',
            backgroundColor: BANNER_CONFIG.COLORS.DEFAULT_BACKGROUND,
            textColor: BANNER_CONFIG.COLORS.DEFAULT_TEXT,
            isActive: true,
            order: 0,
          }}
        >
          <Form.Item
            name="id"
            label="Slide ID"
            rules={[{ required: true, message: 'Please enter slide ID' }]}
            tooltip="Unique identifier for this slide (e.g., slide-1, offer-summer)"
          >
            <Input placeholder="e.g., slide-1" disabled={!!editingSlide} />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select banner type">
              <Option value="offer">Offer</Option>
              <Option value="voucher">Voucher</Option>
              <Option value="coming-soon">Coming Soon</Option>
              <Option value="featured">Featured</Option>
              <Option value="banner">Banner</Option>
              <Option value="flash-sale">Flash Sale</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item name="subtitle" label="Subtitle">
            <Input placeholder="Enter subtitle (optional)" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Enter description (optional)" />
          </Form.Item>

          <Form.Item name="buttonText" label="Button Text">
            <Input placeholder="e.g., Shop Now, View Products" />
          </Form.Item>

          <Form.Item name="buttonLink" label="Button Link">
            <Input placeholder="e.g., /products, /products/category" />
          </Form.Item>

          <Form.Item name="discount" label="Discount (for offers)">
            <Input placeholder="e.g., 50%, 30% OFF" />
          </Form.Item>

          <Form.Item name="voucherCode" label="Voucher Code (for vouchers)">
            <Input placeholder="e.g., SAVE20" />
          </Form.Item>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Form.Item name="backgroundColor" label="Background Color">
              <Input
                type="color"
                placeholder="Select background color"
                style={{ width: '100%', height: '40px' }}
              />
            </Form.Item>

            <Form.Item name="textColor" label="Text Color">
              <Input
                type="color"
                placeholder="Select text color"
                style={{ width: '100%', height: '40px' }}
              />
            </Form.Item>
          </Space>

          <Form.Item name="order" label="Display Order">
            <InputNumber min={0} placeholder="Lower numbers appear first" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" label="Active">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BannerManagement;
