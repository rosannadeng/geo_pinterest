import React from "react";
import { Card, Avatar, Typography, Button, Space } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ProfileCard = ({ profile, isOwner }) => {
  if (!profile) return null;

  return (
    <Card
      cover={
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Avatar
            size={120}
            icon={<UserOutlined />}
            src={profile.profile_picture}
          />
        </div>
      }
      actions={
        isOwner
          ? [
              <Button
                key="edit"
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  // Handle edit profile
                  window.location.href = "/profile/edit";
                }}
              >
                Edit Profile
              </Button>,
            ]
          : []
      }
    >
      <div style={{ textAlign: "center" }}>
        <Title level={4}>{profile.user.username}</Title>
        <Text type="secondary">{profile.bio || "No bio yet"}</Text>
        <Space direction="vertical" style={{ marginTop: "16px", width: "100%" }}>
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer">
              <Text>{profile.website}</Text>
            </a>
          )}
        </Space>
      </div>
    </Card>
  );
};

export default ProfileCard;
