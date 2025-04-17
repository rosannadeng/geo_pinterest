import React from 'react';
import { Layout, Card, Flex, Typography } from 'antd';
import { ArrowDownOutlined } from '@ant-design/icons';

import MasonryGrid from '../features/gallery/components/MasonryGrid';
import ArtworkCard from './ArtworkCard';
import api from '../services/api';
import { useEffect, useState, useMemo } from 'react';
const { Sider } = Layout;
const { Text } = Typography;

// calculate distance between two points, using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // radius of the earth (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const AppSider = ({ artworks, setMapCenter, center }) => {
  return (
    <Sider
      width={420}
      style={{
        backgroundColor: '#fff',
        padding: '16px',
        height: '95vh',
        overflowY: 'auto'
      }}
    >
      <div style={{textAlign: 'center', marginBottom: '16px', alignItems: 'center'}}>
        <Text>Scroll to explore more artworks nearby  </Text> 
        <ArrowDownOutlined style={{fontSize: '12px', marginLeft: '8px'}} />
      </div>

      <Flex vertical gap={16}>
        {artworks.map((artwork) => (
          <ArtworkCard 
            key={artwork.id} 
            artwork={artwork} 
            setMapCenter={setMapCenter} 
          />
        ))}
      </Flex>
    </Sider>
  );
};

export default AppSider; 