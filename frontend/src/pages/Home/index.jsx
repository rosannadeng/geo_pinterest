import React from 'react';
import { Layout } from 'antd';
import AppSider from '../../components/Layout/AppSider';

const { Content } = Layout;

const Home = () => {
  return (
    <Layout>
        <Content>
            <h1>Home Page</h1>
        </Content>
    </Layout>
  );
};

export default Home;