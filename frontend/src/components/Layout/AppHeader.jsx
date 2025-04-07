import React from 'react';
import { Layout, Menu, Button, Avatar } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, PictureOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header } = Layout;

const AppHeader = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token'); 

  const menuItems = [
    { key: 'gallery', label: 'Gallery', icon: <PictureOutlined />, link: '/gallery' },
    { key: 'map', label: 'Map', icon: <PictureOutlined />, link: '/map' },
    { key: 'profile', label: 'Profile', icon: <UserOutlined />, link: '/profile' },
  ];

  // authentication test temporarily by GPT, need replace with real authentication
  const authItems = isAuthenticated
    ? [
        {
          key: 'profile',
          label: (
            <Link to="/profile">
              <Avatar size="small" icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>Profile</span>
            </Link>
          ),
        },
        {
          key: 'logout',
          label: 'Logout',
          icon: <LogoutOutlined />,
          onClick: () => {
            localStorage.removeItem('token');
            navigate('/login');
          },
        },
      ]
    : [
        {
          key: 'login',
          label: <Link to="/login">Login</Link>,
        },
        {
          key: 'register',
          label: <Link to="/register">Register</Link>,
        },
      ];

  return (
    <Header style={{ background: '#fff', padding: '0 24px' }}>
      <div style={{ float: 'left', width: 120, height: 31, margin: '16px 24px 16px 0' }}>
        <Link to="/" style={{ color: 'inherit' }}>Art Community</Link>
      </div>
      <Menu mode="horizontal" items={[...menuItems, ...authItems]} />
    </Header>
  );
};

export default AppHeader; 