import React from 'react';
import { Layout } from 'antd';
import AppSider from '../../common/AppSider';
import ArtworkMap from '../Map/index';

const { Content } = Layout;

const Home = () => {
  return (
    <Layout>
        <Content>
            <ArtworkMap />
        </Content>
    </Layout>
  );
};

export default Home;