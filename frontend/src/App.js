import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Home from './pages/Home/index';
import Gallery from './pages/Gallery/index';
import Profile from './pages/Profile/index';
const { Content } = Layout;


const App = () => {
  return (
    <BrowserRouter>
      <MainLayout>
        <Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Content>
      </MainLayout>
    </BrowserRouter>
  );
};

export default App; 
