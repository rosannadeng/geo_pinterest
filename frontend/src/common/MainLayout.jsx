import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import AppSider from './AppSider';
import { useLocation } from 'react-router-dom'; 

const { Content } = Layout;

const showSiderRoutes = ['/'];

const MainLayout = ({ children }) => {
  const location = useLocation(); 

  return (
    <Layout>
      <AppHeader />
      <Layout>
        {showSiderRoutes.includes(location.pathname) && <AppSider />}
        <Content style={{ padding: '0', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
