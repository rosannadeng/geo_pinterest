import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import MasonryGrid from '../components/MasonryGrid';
import api from '../../../services/api';
import './GalleryPage.css';

const GalleryPage = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await api.get('/artwork');
        setArtworks(response.data);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  const handleArtworkClick = (artwork) => {
    navigate(`/artwork/${artwork.id}`);
  };

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: '20%' }} />;
  }

  return (
    <div className="gallery-container">
      <MasonryGrid
        artworks={artworks}
        onArtworkClick={handleArtworkClick}
      />
    </div>
  );
};

export default GalleryPage; 