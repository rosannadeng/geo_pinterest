import React, { useState } from "react";
import { Form, Input, Button, Upload, message, Card, Typography } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const ArtworkUploadForm = () => {
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const handleUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("/api/artworks/upload-image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      // Populate form fields if backend returns data
      form.setFieldsValue({
        title: data.title || "",
        description: data.description || "",
        location_name: data.location_name || "",
      });

      setImageFile(file);
      message.success("Image uploaded successfully!");
    } catch (error) {
      message.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }

    // Prevent Upload component from uploading again
    return false;
  };

  const handleFinish = async (values) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("location_name", values.location_name);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await axios.post("/api/artworks/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Artwork submitted successfully");
      form.resetFields();
      setImageFile(null);
    } catch (error) {
      message.error("Failed to submit artwork");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", paddingTop: 48 }}>
      <Card>
        <Title level={3} style={{ textAlign: "center" }}>
          Upload New Artwork
        </Title>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item label="Artwork Image" required>
            <Upload
              beforeUpload={handleUpload}
              showUploadList={{ showRemoveIcon: false }}
              accept="image/*"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                Click to Upload
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Location"
            name="location_name"
            rules={[{ required: true, message: "Please enter a location" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Artwork
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ArtworkUploadForm;
