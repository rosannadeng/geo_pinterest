// #Todo:add detail artwork page link user profile, artwork like
import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import ArtworkCard from '../../../common/ArtworkCard';
// TODO: replace with getting artworks from backend

const artwork = { id: 1, title: 'Artwork 1', image: 'https://picsum.photos/200/300' }


const ArtworkDetailPage = () => {
    return (
        <Layout>
                <ArtworkCard artwork={artwork} />
        </Layout>
    );
};

export default ArtworkDetailPage; 