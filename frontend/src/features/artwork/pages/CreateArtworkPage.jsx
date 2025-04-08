import React, { useState } from 'react';
import { Form, Input, DatePicker, Select, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import api from '../../../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const CreateArtworkPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [imageInfo, setImageInfo] = useState(null);

  const handleImageUploaded = (info) => {
    setImageInfo(info);
    form.setFieldsValue({
      medium: info.medium,
      creation_date: info.creation_date ? dayjs(info.creation_date) : null,
      location_name: info.location_name,
    });
  };

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('medium', values.medium);
      formData.append('creation_date', values.creation_date.format('YYYY-MM-DD'));
      formData.append('location_name', values.location_name);
      formData.append('image', imageInfo.image_url);

      const response = await api.post('/artwork/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        message.success('Artwork created successfully');
        navigate('/gallery');
      }
    } catch (error) {
      message.error('Failed to create artwork');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <h1>Create New Artwork</h1>
      <ImageUploader onImageUploaded={handleImageUploaded} />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={!imageInfo}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please input the title!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="medium"
          label="Medium"
          rules={[{ required: true, message: 'Please select the medium!' }]}
        >
          <Select>
            <Option value="OIL">Oil Paint</Option>
            <Option value="ACR">Acrylic</Option>
            <Option value="WAT">Watercolor</Option>
            <Option value="DIG">Digital</Option>
            <Option value="MIX">Mixed Media</Option>
            <Option value="OTH">Other</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="creation_date"
          label="Creation Date"
          rules={[{ required: true, message: 'Please select the creation date!' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="location_name"
          label="Location"
          rules={[{ required: true, message: 'Please input the location!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Create Artwork
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CreateArtworkPage; 