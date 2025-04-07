import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import AppSider from './AppSider';
const { Content } = Layout;

// only show sider on home and profile page, map page is full screen
const showSider = [
  '/',
  '/profile',
]


const MainLayout = ({ children }) => {
  return (
    <Layout>
      <AppHeader />
      <Layout>
        {showSider.includes(window.location.pathname) && <AppSider />} 
        <Content style={{ padding: '0', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 