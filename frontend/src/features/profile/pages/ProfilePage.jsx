// src/features/profile/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Spin, Tabs } from "antd";
import { UploadOutlined, HeartOutlined, PlusOutlined } from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import ProfileCard from "../components/ProfileCard";
import ArtworkGrid from "../components/ArtworkGrid";
import { useParams } from 'react-router-dom';
import api from '../../../services/api';

const { TabPane } = Tabs;

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [featuredArtworks, setFeaturedArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/profile/${username}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchArtworks = async () => {
      try {
        const response = await api.get(`/artwork?artist=${username}`);
        setArtworks(response.data || []);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeaturedArtworks = async () => {
      try {
        const response = await api.get(`/profile/${username}/featured-artworks`);
        console.log(response.data);
        setFeaturedArtworks(response.data ? [response.data] : []);
      } catch (error) {
        console.error('Error fetching featured artworks:', error);
        setFeaturedArtworks([]);
      }
    };

    fetchProfile();
    fetchArtworks();
    fetchFeaturedArtworks();
  }, [username]);

  if (loading || !profile) {
    return <Spin size="large" />;
  }

  const isOwner = (user?.user?.username) === username;
  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <ProfileCard profile={profile} isOwner={isOwner} />
        </Col>
        <Col span={16}>
          <Card>
            <Tabs defaultActiveKey="artworks">
              <TabPane 
                tab={
                  <span>
                    <UploadOutlined />
                    Artworks
                  </span>
                } 
                key="artworks"
              >
                <div style={{ marginTop: '16px' }}>
                  <ArtworkGrid artworks={artworks} />
                </div>
              </TabPane>
              
              <TabPane 
                tab={
                  <span>
                    <HeartOutlined />
                    Likes
                  </span>
                } 
                key="likes"
              >
                <div style={{ marginTop: '16px' }}>
                  <ArtworkGrid artworks={featuredArtworks} />
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
      <div className="gallery-footer">
        <Button className='upload-button'
          type="primary"
          icon={<PlusOutlined />}
          size = "large"
          href="/artwork/create"
        >
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
