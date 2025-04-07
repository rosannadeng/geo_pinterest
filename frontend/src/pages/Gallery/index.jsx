import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'antd';
import ArtworkCard from '../../components/Gallery/ArtworkCard';
// TODO: replace with real API call

import { Layout } from 'antd';

import ImageWall from '../../components/Gallery/ImageWall';

const { Content } = Layout;

const Gallery = () => {
    return (
        <Layout>
            <Content>
                <Card title="Recent Artworks">
                    <ImageWall />
                </Card>
            </Content>
        </Layout>
    );
};

export default Gallery; 