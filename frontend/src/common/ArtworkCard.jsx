import React, { useState } from 'react';
import { Card, Avatar, Typography, Tooltip, Image } from 'antd';
import { UserOutlined, EnvironmentOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ArtworkCard.css';

const { Meta } = Card;
const { Text } = Typography;

const ArtworkCard = ({ artwork, onLike, likeCount }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(likeCount || 0);

  // todo: link to artist profile, handle my profile
  const navigate = useNavigate();

  const handleLike = () => {
    if (!liked) {
      setLikesCount(likesCount + 1);
      setLiked(true);
      if (onLike) {
        onLike(artwork.id);
      }
    }
  };

  return (
    <Card
      hoverable
      // cover={<img alt={artwork.title} src={artwork.image} />}
      cover={<Image alt={artwork.title} src={artwork.image} />}
      actions={[
        <UserOutlined key="artist" 
        onClick={() => navigate(`/profile/${artwork.artist_id}`)}/>,
         // todo: link to artist profile
        <EnvironmentOutlined key="location" />, // todo: link to map view
        <Tooltip title="Like">
          { liked ? 
          <HeartFilled key="like" style={{ color: 'red' }} onClick={handleLike} /> : 
          <HeartOutlined key="like" onClick={handleLike} />}
          <span>{likesCount}</span>
        </Tooltip>
      ]}
    >
      <Meta
        title={artwork.title}
        description={artwork.description}
      />
    </Card>
  );
};

export default ArtworkCard; 