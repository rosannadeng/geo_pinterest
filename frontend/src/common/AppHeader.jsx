import React from 'react';
import { Layout, Menu, AutoComplete, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { PictureOutlined, HomeOutlined, UserOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext.jsx';

const { Header } = Layout;

const AppHeader = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

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
          fontSize: '18px',
          fontWeight: 'bold' 
        }}>
          <Link to="/" style={{ color: 'inherit' }}>Art Community</Link>
        </div>
        <AutoComplete
          options={[]}
          style={{ width: 200 }}
          placeholder="Search"
        />
      </div>

      {/* right */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Menu 
          mode="horizontal" 
          items={menuItems}
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