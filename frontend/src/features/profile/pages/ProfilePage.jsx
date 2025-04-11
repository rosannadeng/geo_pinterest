// src/features/profile/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Spin } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import ProfileCard from "../components/ProfileCard";
import ArtworkGrid from "../components/ArtworkGrid";
import { useParams } from 'react-router-dom';
import api from '../../../services/api';


const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [artworks, setArtworks] = useState([]);
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
        setArtworks(response.data);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchArtworks();
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
          <Card
            title="Artworks"
            extra={
              isOwner && (
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  size="small"
                  href="/artwork/create"
                >
                  Upload New Artwork
                </Button>
              )
            }
          >
            <ArtworkGrid artworks={artworks} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
