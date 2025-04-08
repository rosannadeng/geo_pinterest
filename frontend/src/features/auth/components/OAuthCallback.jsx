import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import auth from '../auth';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      
      if (code) {
        try {
          const success = await auth.handleGoogleCallback(code);
          if (success) {
            const user = await auth.getCurrentUser();
            if (user) {
              if (user.redirect_url) {
                window.location.href = user.redirect_url;
              } else if (user.is_new_user) {
                navigate('/profile/setup');
              } else {
                navigate(`/profile/${user.user.username}`);
              }
            } else {
              navigate('/auth');
            }
          } else {
            navigate('/auth');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          navigate('/auth');
        }
      } else {
        navigate('/auth');
      }
    };

    handleCallback();
  }, [location, navigate]);

  return <div>Processing OAuth callback...</div>;
};

export default OAuthCallback; 