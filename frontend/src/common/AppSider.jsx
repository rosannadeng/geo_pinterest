import React from 'react';
import { Layout, Card, Flex, Typography } from 'antd';
import { ArrowDownOutlined } from '@ant-design/icons';

import MasonryGrid from '../features/gallery/components/MasonryGrid';
import ArtworkCard from './ArtworkCard';
import api from '../services/api';
import { useEffect, useState, useMemo } from 'react';
const { Sider } = Layout;
const { Text } = Typography;

// 计算两点之间的距离（使用 Haversine 公式）
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // 地球半径（公里）
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

  const sortedArtworks = useMemo(() => {

    const isDefaultCenter = center.lat === 39.8283 && center.lng === -98.5795;

    if (isDefaultCenter) {
      return [...artworks].sort((a, b) => 
        new Date(b.upload_date) - new Date(a.upload_date)
      );
    } else {
      const centerArtwork = artworks.find(
        art => art.latitude === center.lat && art.longitude === center.lng
      );

      const otherArtworks = artworks
        .filter(art => art.id !== centerArtwork?.id)
        .sort((a, b) => {
          const distanceA = calculateDistance(
            center.lat, 
            center.lng, 
            a.latitude, 
            a.longitude
          );
          const distanceB = calculateDistance(
            center.lat, 
            center.lng, 
            b.latitude, 
            b.longitude
          );
          return distanceA - distanceB;
        });

      return centerArtwork 
        ? [centerArtwork, ...otherArtworks]
        : otherArtworks;
    }
  }, [artworks, center]);

  return (
    <Sider
      width={420}
      style={{
        backgroundColor: '#fff',
        padding: '16px',
        height: '95vh',   //could be code responsively
        overflowY: 'auto'
      }}>

      <div style={{textAlign: 'center', marginBottom: '16px', alignItems: 'center'}}>
        <Text>Scroll to explore more artworks nearby  </Text> 
        <ArrowDownOutlined style={{fontSize: '12px', marginLeft: '8px'}} />
      </div>

      <Flex vertical gap={16}>
        {sortedArtworks.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} setMapCenter={setMapCenter} />
        ))}
      </Flex>
    </Sider>
  );
};

export default AppSider; 