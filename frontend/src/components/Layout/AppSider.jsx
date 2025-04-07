import React from 'react';
import { Layout, Card } from 'antd';
import ImageWall from '../Gallery/ImageWall';

const { Sider } = Layout;

const AppSider = () => {
  return (
    <Sider width={300} style={{ background: '#fff', padding: '24px' }}>
      <Card title="Recent Artworks">
        <ImageWall />
      </Card>
    </Sider>
  );
};

export default AppSider; 