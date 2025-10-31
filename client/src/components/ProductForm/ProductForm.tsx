import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Upload, message, Select, InputNumber, Spin } from 'antd';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { getToken } from 'utils/localStorage';
import { PRODUCTS_API } from 'services/servicesConstants';
import { fetchAllTagsApi } from 'services/endPoints/products/productsEndpoints';
import axios from 'axios';
import type { UploadFile } from 'antd';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './ProductForm.scss';

const { TextArea } = Input;
const { Option } = Select;

type ProductFormProps = {
  product?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [galleryFiles, setGalleryFiles] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);

  useEffect(() => {
    // Fetch existing tags
    const loadTags = async () => {
      try {
        const { data } = await fetchAllTagsApi();
        setExistingTags(data.tags || []);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    if (product) {
      // Set form fields
      form.setFieldsValue({
        title: product.title,
        price: product.price,
        stock: product.stock || 0,
        slug: product.slug,
        categories: product.categories || [],
        tags: product.tag || [],
      });

      // Convert HTML to EditorState for description
      if (product.body?.description) {
        const contentBlock = htmlToDraft(product.body.description);
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
          const editorState = EditorState.createWithContent(contentState);
          setEditorState(editorState);
        }
      }

      // Set thumbnail file list
      if (product.thumbnail) {
        setFileList([
          {
            uid: '-1',
            name: 'thumbnail',
            status: 'done',
            url: product.thumbnail,
          },
        ]);
      }

      // Set gallery images
      if (product.images && product.images.length > 0) {
        setGalleryFiles(
          product.images.map((img: string, index: number) => ({
            uid: `-${index}`,
            name: `gallery-${index}`,
            status: 'done',
            url: img,
          }))
        );
      }
    }
  }, [product, form]);

  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);

      // Convert editor content to HTML
      const description = draftToHtml(convertToRaw(editorState.getCurrentContent()));

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('body', JSON.stringify({ 
        description,
        summary: values.summary || description.substring(0, 200).replace(/<[^>]*>/g, '')
      }));
      formData.append('price', values.price?.toString() || '0');
      formData.append('stock', values.stock?.toString() || '0');
      formData.append('slug', values.slug || values.title.toLowerCase().replace(/\s+/g, '-'));
      
      // Append categories as array
      if (values.categories && Array.isArray(values.categories)) {
        values.categories.forEach((cat: string) => {
          formData.append('categories', cat);
        });
      }
      
      // Append tags as array
      if (values.tags && Array.isArray(values.tags)) {
        values.tags.forEach((tag: string) => {
          formData.append('tag', tag);
        });
      }

      // Append thumbnail
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('thumbnail', fileList[0].originFileObj);
      }

      // Append gallery images
      galleryFiles.forEach((file) => {
        if (file.originFileObj) {
          formData.append('images', file.originFileObj);
        }
      });

      const token = getToken();
      let response;

      if (product?._id) {
        // Update product
        response = await axios.patch(
          `${PRODUCTS_API}/${product._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        message.success('Product updated successfully');
      } else {
        // Create product
        response = await axios.post(
          `${PRODUCTS_API}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        message.success('Product created successfully');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleThumbnailChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList);
  };

  const handleGalleryChange = ({ fileList: newGalleryFiles }: { fileList: UploadFile[] }) => {
    setGalleryFiles(newGalleryFiles);
  };

  const beforeUpload = () => {
    return false; // Prevent auto upload
  };

  return (
    <Spin spinning={submitting}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          price: 0,
          stock: 0,
          categories: [],
          tags: [],
        }}
      >
        <Form.Item
          name="title"
          label="Product Title"
          rules={[{ required: true, message: 'Please enter product title' }]}
        >
          <Input placeholder="Enter product title" />
        </Form.Item>

        <Form.Item
          name="price"
          label="Price ($)"
          rules={[{ required: true, message: 'Please enter price' }]}
        >
          <InputNumber
            min={0}
            step={0.01}
            style={{ width: '100%' }}
            placeholder="Enter price"
          />
        </Form.Item>

        <Form.Item
          name="stock"
          label="Stock Quantity"
          rules={[{ required: true, message: 'Please enter stock quantity' }]}
        >
          <InputNumber
            min={0}
            style={{ width: '100%' }}
            placeholder="Enter stock quantity"
          />
        </Form.Item>

        <Form.Item
          name="categories"
          label="Categories"
          rules={[{ required: true, message: 'Please select at least one category' }]}
        >
          <Select
            mode="tags"
            placeholder="Select or add categories"
            onChange={(value) => setCategories(value)}
          >
            <Option value="electronics">Electronics</Option>
            <Option value="clothing">Clothing</Option>
            <Option value="books">Books</Option>
            <Option value="home">Home & Kitchen</Option>
            <Option value="accessories">Accessories</Option>
            <Option value="sports">Sports</Option>
            <Option value="toys">Toys</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="tags"
          label="Tags"
        >
          <Select
            mode="tags"
            placeholder="Select or add tags"
            onChange={(value) => setTags(value)}
            filterOption={(input, option) =>
              (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {existingTags.map((tag) => (
              <Option key={tag} value={tag}>
                {tag}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Thumbnail Image"
          rules={[{ required: !product, message: 'Please upload thumbnail image' }]}
        >
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={handleThumbnailChange}
            beforeUpload={beforeUpload}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload Thumbnail</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Gallery Images"
        >
          <Upload
            listType="picture-card"
            fileList={galleryFiles}
            onChange={handleGalleryChange}
            beforeUpload={beforeUpload}
            multiple
          >
            {galleryFiles.length < 10 && '+ Upload'}
          </Upload>
        </Form.Item>

        <Form.Item
          label="Description"
          rules={[{ required: true, message: 'Please enter product description' }]}
        >
          <div className="product-editor-wrapper">
            <Editor
              editorState={editorState}
              onEditorStateChange={handleEditorChange}
              wrapperClassName="editor-wrapper"
              editorClassName="editor-content"
              toolbar={{
                options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'link', 'image', 'remove', 'history'],
              }}
            />
          </div>
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {onCancel && (
              <Button onClick={onCancel}>Cancel</Button>
            )}
            <Button type="primary" htmlType="submit" loading={submitting}>
              {product ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Spin>
  );
};
