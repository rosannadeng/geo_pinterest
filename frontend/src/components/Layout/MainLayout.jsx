import React from 'react';
import { Layout } from 'antd';
import AppHeader from './AppHeader';
import AppSider from './AppSider';
const { Content } = Layout;

const MainLayout = ({ children }) => {
  return (
    <Layout>
      <AppHeader />
      <Layout>
        <AppSider />
        <Content style={{ padding: '0', minHeight: 'calc(100vh - 64px)' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout; 