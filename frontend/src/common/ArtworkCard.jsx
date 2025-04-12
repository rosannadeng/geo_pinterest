import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Tooltip, Image, message } from 'antd';
import { UserOutlined, EnvironmentOutlined, HeartOutlined, HeartFilled, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './ArtworkCard.css';
import LikeButton from './LikeButton';

const { Meta } = Card;
const { Text } = Typography;

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
    console.log('Artwork object:', artwork);
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

  const handleView = (artworkId) => {
    // TODO: Implement artwork details view
    console.log('Viewing artwork:', artworkId);
    navigate(`/artwork/${artworkId}`);
    // navigate(`/artwork/${artwork.id}`);

    
  };

  

  return (
    <Card 
      className="artwork-card"
      cover={
        <div className="artwork-card-cover">
          <Image alt={artwork.title} src={artwork.image} preview={false} className="artwork-card-image" />

          <div className="like-icon">
            <LikeButton 
                artworkId={artwork.id} 
                initialLikes={artwork.total_likes}
            />
        </div>

        <div className="mask" onClick={() => handleView(artwork.id)}>
            <EyeOutlined key="view" onClick={(e) => {
                  e.stopPropagation();
              }}
            />
            <span>View Details</span>

      </div>

        </div>
      }
      hoverable={true}
    >
  </Card>
  );
};

export default ArtworkCard; 