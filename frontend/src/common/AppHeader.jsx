import React, { useState, useEffect } from 'react';
import { Layout, Menu, AutoComplete, Button } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PictureOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext.jsx';
import artiverseTitle from '../assets/images/artiverse-title.png';

const { Header } = Layout;

const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [selectedKey, setSelectedKey] = useState('');

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/gallery')) setSelectedKey('gallery');
    else if (path.startsWith('/map')) setSelectedKey('map');
    else if (path.startsWith('/profile')) setSelectedKey('profile');
  }, [location]);

  const menuItems = [
    { 
      key: 'gallery',
      label: <Link to="/gallery">Gallery</Link>,
      icon: <PictureOutlined />
    },
    { 
      key: 'map',
      label: <Link to="/map">Map</Link>,
      icon: <PictureOutlined />
    },
    {
      key: 'profile',
      label: <Link to={`/profile/${user?.user?.username}`}>Profile</Link>,
      icon: <UserOutlined />
    }
  ];

  const handleLogoClick = () => {
    setSelectedKey('map');
    navigate('/map');
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <Header 
      style={{ 
        background: '#fff', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      {/* left */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center'
      }}>
        <div style={{ 
          marginRight: '24px',
        }}>
          <a onClick={handleLogoClick} style={{ color: 'inherit', cursor: 'pointer' }}>
            <img 
              src={artiverseTitle} 
              alt="Artiverse" 
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </a>
        </div>
      </div>

      {/* right */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Menu 
          mode="horizontal" 
          items={menuItems}
          selectedKeys={[selectedKey]}
          style={{ border: 'none' }}
        />
        {isAuthenticated ? (
          <Button 
            type="text" 
            icon={<UserOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button 
              type="text" 
              icon={<LoginOutlined />}
              onClick={() => navigate('/auth')}
            >
              Login
            </Button>
          </div>
        )}
      </div>
    </Header>
  );
};

export default AppHeader; 