import React, { useState, useEffect } from 'react';
import { Card, Typography, Image } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ArtworkCard.css';
import LikeButton from './LikeButton';

const { Title } = Typography;

const ArtworkCard = ({ artwork, setMapCenter }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liked, setLiked] = useState(artwork.is_liked);
  const [likesCount, setLikesCount] = useState(artwork.total_likes);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (user && user.user) {
        try {
          const response = await api.get(`/artwork/${artwork.id}/check_if_liked/`);
          setLiked(response.data.liked);
          setLikesCount(response.data.likes_count);
        } catch (error) {
          console.error('Error checking if artwork is liked:', error);
        }
      }
    };

    if (artwork.id) {
      checkIfLiked();
    }
  }, [user, artwork.id]);

  const handleView = (artworkId) => {
    if (setMapCenter) {
      setMapCenter({
        lat: artwork.latitude,
        lng: artwork.longitude,
      }, 15);
    }
    else {
      navigate(`/artwork/${artworkId}`);
    }
  };

  return (
    <Card
      className="artwork-card"
      hoverable
      cover={
        <div className="artwork-card-cover">
          <Image
            alt={artwork.title}
            src={artwork.image}
            preview={false}
            className="artwork-card-image"
          />

          <div className="like-icon">
            <LikeButton
              artworkId={artwork.id}
              initialLikes={artwork.total_likes}
            />
          </div>

          <div className="mask" onClick={() => handleView(artwork.id)}>
            <div className="mask-center">
              <EyeOutlined />
              <span style={{ marginLeft: 8 }}>View Details</span>
            </div>

            <Title className="mask-title">
              <span className="artwork-title">{artwork.title}</span>
            </Title>
          </div>
        </div>
      }
    />
  );
};

export default ArtworkCard; 