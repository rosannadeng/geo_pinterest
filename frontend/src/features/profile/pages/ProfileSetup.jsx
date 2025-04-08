import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import auth from '../../auth/auth';
import api from '../../../services/api';

const ProfileSetup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await auth.getCurrentUser();
        setUser(userData);
        form.setFieldsValue({
          username: userData.user.username,
          email: userData.user.email,
        });
      } catch (error) {
        console.error('Error loading user:', error);
        navigate('/auth');
      }
    };
    loadUser();
  }, [form, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bio', values.bio || '');
      formData.append('website', values.website || '');
      if (values.profile_picture) {
        formData.append('profile_picture', values.profile_picture.file);
      }

      await api.post('/profile/setup', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('Profile updated successfully');
      navigate(`/profile/${user.user.username}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <h1>Complete Your Profile</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          bio: '',
          website: '',
        }}
      >
        <Form.Item
          label="Username"
          name="username"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Bio"
          name="bio"
        >
          <Input.TextArea rows={4} placeholder="Tell us about yourself" />
        </Form.Item>

        <Form.Item
          label="Website"
          name="website"
        >
          <Input placeholder="Your website URL" />
        </Form.Item>

        <Form.Item
          label="Profile Picture"
          name="profile_picture"
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            name="profile_picture"
            listType="picture"
            beforeUpload={() => false}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Profile
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProfileSetup; 