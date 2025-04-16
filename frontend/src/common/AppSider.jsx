import React from 'react';
import { Layout, Card, Flex } from 'antd';
import ArtworkCard from './ArtworkCard';
const { Sider } = Layout;

const AppSider = ({ artworks, setMapCenter }) => {
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