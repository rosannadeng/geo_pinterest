import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Tooltip, Image, message } from 'antd';
import { UserOutlined, EnvironmentOutlined, HeartOutlined, HeartFilled, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ArtworkCard.css';
import LikeButton from './LikeButton';

const { Meta } = Card;
const { Text, Title } = Typography;


const ArtworkCard = ({ artwork, setMapCenter }) => {
  const navigate = useNavigate();
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
    console.log('Viewing artwork:', artworkId);
    if (setMapCenter) {
      setMapCenter({
        lat: artwork.latitude,
        lng: artwork.longitude,
      });
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
            <div className="mask-center" onClick={(e) => e.stopPropagation()}>
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