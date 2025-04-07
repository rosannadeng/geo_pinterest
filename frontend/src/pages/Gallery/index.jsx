import React, { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import ArtworkCard from '../../components/Gallery/ArtworkCard';
import { getArtworks } from '../../services/api';

const Gallery = () => {
  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await getArtworks();
        setArtworks(response.data);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      }
    };
    fetchArtworks();
  }, []);

  return (
    <Row gutter={[16, 16]}>
      {artworks.map(artwork => (
        <Col xs={24} sm={12} md={8} lg={6} key={artwork.id}>
          <ArtworkCard artwork={artwork} />
        </Col>
      ))}
    </Row>
  );
};

export default Gallery; 