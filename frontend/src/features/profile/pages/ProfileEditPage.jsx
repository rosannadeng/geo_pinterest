import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, Upload, message, Avatar } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const ProfileEditPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!currentUser || currentUser.user.username !== username) {
          message.error('You do not have permission to edit this profile');
          navigate(`/profile/${username}`);
          return;
        }

        const response = await api.get(`/profile/${username}`);
        const profileData = response.data;
        
        form.setFieldsValue({
          username: profileData.user.username,
          email: profileData.user.email,
          bio: profileData.bio || '',
          website: profileData.website || '',
        });
        
        if (profileData.profile_picture) {
          setPreviewImage(profileData.profile_picture);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        message.error('Failed to load profile');
        navigate(`/profile/${username}`);
      }
    };
    loadProfile();
  }, [form, navigate, username, currentUser]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('bio', values.bio || '');
      formData.append('website', values.website || '');
      
      if (values.profile_picture && values.profile_picture.length > 0) {
        formData.append('profile_picture', values.profile_picture[0].originFileObj);
      }

      await api.put(`/profile/${username}/edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('Profile updated successfully');
      navigate(`/profile/${username}`);
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

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
      <h1>Complete Your Profile</h1>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Avatar
          size={120}
          src={previewImage}
          icon={<UserOutlined />}
        />
      </div>
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
            onChange={({ fileList }) => {
              if (fileList.length > 0) {
                handlePreview(fileList[0]);
              } else {
                setPreviewImage(null);
              }
            }}
          >
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProfileEditPage; 