import React from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, PictureOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header } = Layout;

const AppHeader = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token'); 

  const menuItems = [
    { key: 'gallery', label: 'Gallery', icon: <PictureOutlined />, onClick: () => navigate('/gallery') },
    { key: 'map', label: 'Map', icon: <PictureOutlined />, onClick: () => navigate('/map') },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, onClick: () => navigate('/profile') },
  ];

  // authentication test temporarily by GPT, need replace with real authentication

  

  return (
    <Header style={{ background: '#fff', padding: '0 24px' }}>
      <div style={{ float: 'left', width: 120, height: 31, margin: '16px 24px 16px 0' }}>
        <Link to="/" style={{ color: 'inherit' }}>Art Community</Link>
      </div>
      <Menu mode="horizontal" items={[...menuItems]} />
    </Header>
  );
};

export default AppHeader; 