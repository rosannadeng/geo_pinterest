import React from 'react';
import { Layout, Card, Flex } from 'antd';
import MasonryGrid from '../features/gallery/components/MasonryGrid';
import ArtworkCard from './ArtworkCard';
import api from '../services/api';
import { useEffect, useState } from 'react';
const { Sider } = Layout;

const AppSider = ({ setMapCenter }) => {

  const [artworks, setArtworks] = useState([]);

  useEffect(() => {
    const fetchArtworks = async () => {
      const response = await api.get('/artwork');
      setArtworks(response.data);
      console.log(response.data);
    };
    fetchArtworks();
  }, []);

  return (
    <Sider
      width={420}
      style={{
        backgroundColor: '#fff',
        padding: '24px',
        height: '95vh',   //could be code responsively
        overflowY: 'auto'
      }}>
      <Flex vertical gap={16}>
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} setMapCenter={setMapCenter} />
        ))}
      </Flex>

    </Sider>
  );
};

export default AppSider; 