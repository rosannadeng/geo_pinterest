import React, { useState, useEffect } from 'react';
import { Space, Tooltip, message } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';


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


const LikeButton = ({ artworkId, initialLikes = 0, showCount = true, onLikeChange }) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikes);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const checkIfLiked = async () => {
            if (user && user.user) {
                try {
                    const response = await api.get(`/artwork/${artworkId}/check_if_liked/`);
                    console.log('response.data.liked', response.data.liked);
                    setLiked(response.data.liked);
                    setLikesCount(response.data.likes_count);
                } catch (error) {
                    console.error('Error checking if artwork is liked:', error);
                }
            }
        };

        if (artworkId) {
            checkIfLiked();
        }
    }, [user, artworkId]);

    const handleLike = async (e) => {
        if (e) {
            e.stopPropagation();
        }

        if (!user || !user.user) {
            message.info('Please login to like artworks');
            navigate('/auth');
            return;
        }

        try {
            const newLikedState = !liked;
            setLiked(newLikedState);
            setLikesCount(newLikedState ? likesCount + 1 : likesCount - 1);

            const response = await api.post(`/artwork/${artworkId}/like/`, null, {
                headers: {
                    'X-CSRFToken': getCSRFToken(),
                },
                withCredentials: true,
            });
            
            console.log('Like response:', response.data);
            setLikesCount(response.data.likes_count);
            
            if (onLikeChange) {
                onLikeChange();
            }
        } catch (error) {
            console.error('Error liking artwork:', error);
            setLiked(!liked);
            setLikesCount(liked ? likesCount - 1 : likesCount + 1);
            message.error('Failed to like artwork. Please try again.');
        }
    };

    return (
        <Space>
            <Tooltip title={liked ? 'Unlike' : 'Like'}>
                {liked ? (
                    <HeartFilled
                        style={{ color: 'red', fontSize: '18px', cursor: 'pointer' }}
                        onClick={handleLike}
                    />
                ) : (
                    <HeartOutlined
                        style={{ fontSize: '18px', cursor: 'pointer' }}
                        onClick={handleLike}
                    />
                )}
            </Tooltip>
            {showCount && <span>{likesCount}</span>}
        </Space>
    );
};

export default LikeButton;
