import React from 'react';
import { Layout, Menu, AutoComplete } from 'antd';
import { Link } from 'react-router-dom';
import { PictureOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';

const { Header } = Layout;

const AppHeader = () => {
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
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />
    }
  ];

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
      <Menu 
        mode="horizontal" 
        items={menuItems}
        style={{ 
          background: '#fff',
          border: 'none',
          flex: 'none',
          marginLeft: 'auto'
        }} 
      />
    </Header>
  );
};

export default AppHeader; 