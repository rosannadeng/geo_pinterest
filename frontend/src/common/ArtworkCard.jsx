import React from 'react';
import { Card, Avatar, Typography } from 'antd';
import { UserOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons';

const { Meta } = Card;
const { Text } = Typography;

const ArtworkCard = ({ artwork }) => {
  return (
    <Card
      hoverable
      cover={<img alt={artwork.title} src={artwork.image} />}
      actions={[
        <UserOutlined key="artist" />,
        <EnvironmentOutlined key="location" />,
        <CalendarOutlined key="date" />
      ]}
    >
      <Meta
        title={artwork.title}
        description={artwork.description}
        avatar={<Avatar src={artwork.artist.avatar} />}
      />
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">Location: {artwork.location_name}</Text>
        <br />
        <Text type="secondary">Created: {artwork.creation_date}</Text>
      </div>
    </Card>
  );
};

export default ArtworkCard; 