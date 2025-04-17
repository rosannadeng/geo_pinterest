import React from 'react';
import { Layout } from 'antd';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './common/MainLayout.jsx';
import ProfilePage from './features/profile/pages/ProfilePage.jsx';
import AuthPage from './features/auth/pages/AuthPage.jsx';
import MapPage from './features/map/index.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext.jsx';
import CreateArtworkPage from './features/artwork/pages/CreateArtworkPage.jsx';
import GalleryPage from './features/gallery/pages/GalleryPage.jsx';
import ArtworkDetailPage from './features/artwork/pages/ArtworkDetailPage.jsx';
import ProfileEditPage from './features/profile/pages/ProfileEditPage.jsx';
import AuthCompletePage from './features/auth/pages/AuthCompletePage.jsx';

const { Content } = Layout;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AppContent = () => {
  return (
    <MainLayout>
      <Content>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/complete/frontend" element={<AuthCompletePage />} />

          {/* Protected Routes */}
          <Route path="/gallery" element={
            <ProtectedRoute>
              <GalleryPage />
            </ProtectedRoute>
          } />
          <Route path="/profile/:username" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/:username/edit" element={
            <ProtectedRoute>
              <ProfileEditPage />
            </ProtectedRoute>
          } />
          <Route path="/map" element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          } />
          <Route path="/artwork/create" element={
            <ProtectedRoute>
              <CreateArtworkPage />
            </ProtectedRoute>
          } />
          <Route path="/artwork/:id" element={
            <ProtectedRoute>
              <ArtworkDetailPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Content>
    </MainLayout>
  );
};

const App = () => {
  return (
    <GoogleMapsProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </GoogleMapsProvider>
  );
};

export default App; 
