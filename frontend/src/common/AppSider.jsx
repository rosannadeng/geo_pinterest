import React from 'react';
import { Layout, Flex, Typography } from 'antd';
import { ArrowDownOutlined } from '@ant-design/icons';

import ArtworkCard from './ArtworkCard';
const { Sider } = Layout;
const { Text } = Typography;

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
      <div style={{ textAlign: 'center', marginBottom: '16px', alignItems: 'center' }}>
        <Text>Scroll to explore more artworks nearby  </Text>
        <ArrowDownOutlined style={{ fontSize: '12px', marginLeft: '8px' }} />
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