// #Todo:add detail artwork page link user profile, artwork like
import React, { useState, useEffect } from 'react';
import { Layout, Image, Card } from 'antd';
import { useParams } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';


const ArtworkDetailPage = () => {

    const { id: artworkId } = useParams(); 
    console.log("artworkId", artworkId);

    const [artwork, setArtwork] = useState([]);

   
    useEffect(() => {
    const fetchArtwork = async () => {
        const response = await api.get(`/artwork/${artworkId}`);
        setArtwork(response.data);
        console.log(response.data);
    };
    fetchArtwork();
   }, [artwork]);

  



    return (
        <Card>
            {artwork && <Image src={artwork.image} />}
        </Card>
    );
};

export default ArtworkDetailPage; 