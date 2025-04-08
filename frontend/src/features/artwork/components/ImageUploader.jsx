import React, { useState } from 'react';
import { Upload, message, Spin, Image } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import api from '../../../services/api';

const { Dragger } = Upload;

const ImageUploader = ({ onImageUploaded }) => {
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const uploadProps = {
    name: 'image',
    multiple: false,
    accept: 'image/*',
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/artwork/upload-image/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'X-CSRFToken': getCookie('csrftoken'),
          },
          withCredentials: true,
        });

        if (response.data) {
          setPreviewImage(URL.createObjectURL(file));
          onImageUploaded(response.data);
          onSuccess('ok');
        }
      } catch (error) {
        message.error('Upload failed');
        onError(error);
      } finally {
        setLoading(false);
      }
    },
  };

  return (
    <div>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single image upload
        </p>
      </Dragger>
      {loading && <Spin style={{ marginTop: 16 }} />}
      {previewImage && (
        <div style={{ marginTop: 16 }}>
          <Image
            src={previewImage}
            alt="preview"
            style={{ maxWidth: '100%', maxHeight: 300 }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 