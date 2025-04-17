// #Todo:add detail artwork page link user profile, artwork like
import React, { useState, useEffect } from 'react';
import { Image, Card, Row, Col, Typography, Tooltip, message, Space, Avatar, Button, Modal, Tabs, List } from 'antd';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { HeartOutlined, EnvironmentOutlined, ClockCircleOutlined, EditOutlined, DeleteOutlined, UserOutlined, CommentOutlined } from '@ant-design/icons';
import LikeButton from '../../../common/LikeButton';
import CommentSection from '../components/CommentSection';
import './ArtworkDetailPage.css';


const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const MEDIUM_NAME = {
    OIL: "Oil Paint",
    ACR: "Acrylic",
    WAT: "Watercolor",
    DIG: "Digital",
    MIX: "Mixed Media",
    OTH: "Other"
};

const ArtworkDetailPage = () => {
    const { id: artworkId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [artwork, setArtwork] = useState(null);
    const [showLikersModal, setShowLikersModal] = useState(false);
    const [comments, setComments] = useState([]);
    const [likers, setLikers] = useState([]);

    useEffect(() => {
        const fetchArtwork = async () => {
            try {
                const response = await api.get(`/artwork/${artworkId}`);
                setArtwork(response.data);
                setComments(response.data.comments || []);
            } catch (error) {
                message.error('Failed to load artwork');
            }
        };

        fetchArtwork();
    }, [artworkId]);

    const fetchLikers = async () => {
        try {
            const response = await api.get(`/artwork/${artworkId}/likers`);
            setLikers(response.data);
        } catch (error) {
            console.error('Error fetching likers:', error);
        }
    };


    const handleTabChange = (key) => {
        if (key === 'likes') {
            fetchLikers();
        }
    };

    const handleDelete = () => {
        confirm({
            title: 'Delete Artwork',
            content: 'Are you sure you want to delete this artwork? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await api.delete(`/artwork/${artworkId}/delete`);
                    message.success('Artwork deleted successfully');
                    navigate('/gallery');
                } catch (error) {
                    message.error('Failed to delete artwork');
                }
            },
        });
    };

    if (!artwork) {
        return null;
    }

    const isOwner = user?.user?.username === artwork.artist_username;

    return (
        <Card style={{ margin: '40px auto', width: '80%', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Row gutter={32}>
                <Col span={14}>
                    <Image
                        src={artwork.image}
                        alt={artwork.title}
                        style={{ width: '100%', borderRadius: '12px' }}
                    />
                </Col>

                <Col span={10}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Title level={3} style={{ marginBottom: 8 }}>{artwork.title}</Title>
                        </Col>
                        {isOwner && (
                            <Col>
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>
                            </Col>
                        )}
                    </Row>

                    <Space size="middle" style={{ marginBottom: 16 }}>
                        <Tooltip title="View user profile">
                            <Link to={`/profile/${artwork.artist_username}`}>
                                <Avatar src={artwork.artist_profile_picture} />
                            </Link>
                        </Tooltip>
                        <Link to={`/profile/${artwork.artist_username}`}>
                            <Text strong>@{artwork.artist_username}</Text>
                        </Link>
                    </Space>

                    <Paragraph>{artwork.description}</Paragraph>

                    <Space style={{ display: 'flex', marginBottom: 8 }}>
                        <ClockCircleOutlined />
                        <Text type="secondary">{new Date(artwork.creation_date).toLocaleDateString()}</Text>
                    </Space>

                    <Space style={{ display: 'flex', marginBottom: 8 }}>
                        <EditOutlined />
                        <Text type="secondary">{MEDIUM_NAME[artwork.medium]}</Text>
                    </Space>

                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('/map', {
                                    state: {
                                        from: 'artwork_detail',
                                        artwork: artwork  // pass artwork data to map page
                                    }
                                })}
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
                                onLikeChange={fetchLikers}
                            />
                        </Col>
                    </Row>


                </Col>
            </Row>

            <Tabs defaultActiveKey="comments" className="artwork-tabs" onChange={handleTabChange}>
                <TabPane
                    tab={
                        <span>
                            <CommentOutlined />
                            Comments {artwork?.comments?.length}
                        </span>
                    }
                    key="comments"
                >
                    <CommentSection artworkId={artwork.id} />
                </TabPane>
                <TabPane
                    tab={
                        <span>
                            <HeartOutlined />
                            Likes {artwork?.total_likes}
                        </span>
                    }
                    key="likes"
                >
                    <div className="likers-section" isOwner={isOwner}>
                        <List
                            dataSource={likers}
                            renderItem={liker => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar
                                                linkto={`/profile/${liker.username}`}
                                                src={liker.profile_picture}
                                                icon={!liker.profile_picture && <UserOutlined />}
                                            />
                                        }
                                        title={<Text strong><Link to={`/profile/${liker.username}`}>{liker.username}</Link></Text>}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                </TabPane>
            </Tabs>


        </Card>
    );
};

export default ArtworkDetailPage; 