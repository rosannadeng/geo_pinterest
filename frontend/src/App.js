import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './common/MainLayout.jsx';
import Home from './pages/Home/index.jsx';
import ProfilePage from './features/profile/pages/ProfilePage.jsx';
import AuthPage from './features/auth/pages/AuthPage.jsx';
import MapPage from './pages/Map/index.jsx';
import OAuthCallback from './features/auth/components/OAuthCallback.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext.jsx';
import CreateArtworkPage from './features/artwork/pages/CreateArtworkPage.jsx';
import GalleryPage from './features/gallery/pages/GalleryPage.jsx';
import ArtworkDetailPage from './features/artwork/pages/ArtworkDetailPage.jsx';
import ProfileEditPage from './features/profile/pages/ProfileEditPage.jsx';
import AuthCompletePage from './features/auth/pages/AuthCompletePage.jsx';
const { Content } = Layout;

const App = () => {
  return (
    <GoogleMapsProvider>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout>
            <Content>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/profile/:username" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<ProfileEditPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/oauth/complete/google-oauth2" element={<OAuthCallback />} />
                <Route path="/artwork/create" element={<CreateArtworkPage />} />
                <Route path="/artwork/:id" element={<ArtworkDetailPage />} />
                <Route path="/auth/complete" element={<AuthCompletePage />} />
              </Routes>
            </Content>
          </MainLayout>
        </BrowserRouter>
      </AuthProvider>
    </GoogleMapsProvider>
  );
};

export default App; 
