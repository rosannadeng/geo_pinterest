import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout.jsx';
import Home from './pages/Home/index.jsx';
import Gallery from './pages/Gallery/index.jsx';
import ProfilePage from './features/profile/pages/profile.jsx'; 
import AuthPage from './features/auth/pages/AuthPage.jsx';
import MapPage from './pages/Map/index.jsx';
import OAuthCallback from './features/auth/components/OAuthCallback.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import CreateArtworkPage from './features/artwork/pages/CreateArtworkPage.jsx';
const { Content } = Layout;

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Content>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/oauth/complete/google-oauth2" element={<OAuthCallback />} />
              <Route path="/artwork/create" element={<CreateArtworkPage />} />
            </Routes>
          </Content>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App; 
