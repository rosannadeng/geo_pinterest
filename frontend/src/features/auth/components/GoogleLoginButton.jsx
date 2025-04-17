import React from 'react';
import GoogleButton from 'react-google-button';
import auth from '../auth';

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    const googleAuthUrl = auth.getGoogleAuthUrl();
    window.location.href = googleAuthUrl;
  };

  return (
    <GoogleButton
      onClick={handleGoogleLogin}
      label="Continue with Google"
    />
  );
};

export default GoogleLoginButton;