import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'antd';
import ArtworkCard from '../../common/ArtworkCard';


import { Layout } from 'antd';

import ImageWall from '../../components/Gallery/ImageWall';

const { Content } = Layout;

// TODO: replace with getting artworks from backend
const artworks = [
    { id: 1, title: 'Artwork 1', image: 'https://picsum.photos/200/300' },
    { id: 2, title: 'Artwork 2', image: 'https://picsum.photos/200/300' },
    { id: 3, title: 'Artwork 3', image: 'https://picsum.photos/200/300' },
]

const Gallery = () => {
    return (
        <Layout>
            <Content>
                <Card title="Recent Artworks">
                    <ImageWall artworks={artworks} />
                </Card>
            </Content>
        </Layout>
    );
};

export default Gallery; 