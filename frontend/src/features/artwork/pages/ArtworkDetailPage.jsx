// #Todo:add detail artwork page link user profile, artwork like
import React, { useState, useEffect } from 'react';
import { Layout, Image, Card } from 'antd';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';



const ArtworkDetailPage = ({ artworkId }) => {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
  
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    console.log(id);
    console.log(artworkId);
    const [artwork, setArtwork] = useState(null);   

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const response = await api.get(`/artwork/${id}`);
                
                setArtwork(response.data);
                setLikesCount(response.data.total_likes || 0);
                console.log('Fetching artwork with id:', id);
                console.log('API response:', response.data);
            } catch (error) {
                console.error('Error fetching artwork:', error);
            }
        };
        if (id) {
            fetchArtwork();
            console.log(artwork);
        }
    }, [id]);

  



    return (
        <Card>
            {artwork && <Image src={artwork.image} />}
        </Card>
    );
};

export default ArtworkDetailPage; 