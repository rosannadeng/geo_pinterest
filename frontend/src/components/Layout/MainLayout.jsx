import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout>
      <AppHeader />
      <Layout>
        <Content style={{ padding: '24px', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 