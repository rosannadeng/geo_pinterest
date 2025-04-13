// #Todo:add detail artwork page link user profile, artwork like
import React, { useState, useEffect } from 'react';
import { Layout, Image, Card, Row, Col, Typography, Tooltip, message, Space, Avatar } from 'antd';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HeartFilled, HeartOutlined, EnvironmentOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import LikeButton from '../../../common/LikeButton';
const { Title, Text, Paragraph } = Typography;



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
   }, [artworkId]);

   const navigate = useNavigate();
   // todo: add artwork on map feature
   const handleMapClick = () => {
    navigate(`/map`);
   }
  



    return (
        <Card style={{ margin:'40px auto',width:'80%',borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Row gutter={32}>

          <Col span={14}>
            <Image
              src={artwork.image}
              alt={artwork.title}
              style={{ width: '100%', borderRadius: '12px' }}
            />
          </Col>
  
          {/* 右侧文字 */}
          <Col span={10} >

            <Title level={3} style={{ marginBottom: 8 }}>{artwork.title}</Title>
  
            <Space size="middle" style={{ marginBottom: 16 }}>
              <Tooltip title="View user profile">
                <Link to={`/profile/${artwork.artist_username}`}>
                  <Avatar src={`${artwork.artist_profile_picture}`} />
                </Link>
              </Tooltip>
              <Link to={`/profile/${artwork.artist_username}`}>
                <Text strong>@{artwork.artist_username}</Text>
              </Link>
            </Space>
            
  
            <Paragraph >{artwork.description}</Paragraph>

  


            <Space style={{ display: 'flex', marginBottom: 8 }}>
              <ClockCircleOutlined />
              <Text type="secondary">{new Date(artwork.creation_date).toLocaleDateString()}</Text>
            </Space>

            <Space style={{ display: 'flex', marginBottom: 8 }}>
              <EditOutlined />
              <Text type="secondary">{artwork.medium}</Text>
            </Space>

            <Row justify="space-between" align="middle">
              <Col>
                <Space
                  style={{ cursor: 'pointer' }}
                  onClick={handleMapClick}
                >
                  <Tooltip title="View on map">
                    <EnvironmentOutlined />
                  </Tooltip>
                  <Text type="secondary">{artwork.location_name}</Text>
                </Space>
              </Col>
              <Col>
                <LikeButton 
                  artworkId={artwork.id} 
                  initialLikes={artwork.total_likes}
                />
              </Col>
            </Row>

          </Col>
        </Row>
      </Card>
    );
};

export default ArtworkDetailPage; 