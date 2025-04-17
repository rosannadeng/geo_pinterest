import React, { useState, useEffect } from 'react';
import { Card, Avatar, Tooltip, Image, message } from 'antd';
import { UserOutlined, EnvironmentOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ArtworkCard.css';

const { Meta } = Card;

// Function that gets the CSRF token from the cookie  
const getCSRFToken = () => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, 'csrftoken'.length + 1) === ('csrftoken' + '=')) {
        cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const ArtworkCard = ({ artwork, onLike }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(artwork.total_likes || 0);

  const { user } = useAuth();
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

  useEffect(() => {
  }, [artwork]);

  // Function that runs when user clicks the like button
  const handleLike = async () => {
    if (!user || !user.user) {
      message.info('Please login to like artworks');
      navigate('/auth');
      return;
    }

    try {
      const newLikedState = !liked; // Toggle like status
      setLiked(newLikedState);
      setLikesCount(newLikedState ? likesCount + 1 : likesCount - 1);

      const response = await api.post(`/artwork/${artwork.id}/like/`, null, {
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,
      });

      setLikesCount(response.data.likes_count);


    } catch (error) {
      console.error('Error liking artwork:', error);
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
      message.error('Failed to like artwork. Please try again.');
    }
  };

  return (
    <Card
      hoverable
      cover={<Image alt={artwork.title} src={artwork.image} />}
      actions={[
        <Tooltip title={`View ${artwork.artist_username}'s profile`}>
          <Avatar
            key="artist"
            src={artwork.artist_profile_picture}
            icon={!artwork.artist_profile_picture && <UserOutlined />}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/profile/${artwork.artist_username}`)}
          />
        </Tooltip>,
        <Tooltip title="View on map">
          <EnvironmentOutlined key="location" />
        </Tooltip>,
        <Tooltip title="Like">
          {liked ?
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