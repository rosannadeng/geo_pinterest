// src/pages/AuthCompletePage.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userStr = params.get("user");

    if (userStr) {
      try {
        // With session auth, the user is already authenticated via cookies
        // We just need to parse the user data if available
        navigate("/gallery");
      } catch (error) {
        console.error("Error parsing user data:", error);
        navigate("/auth");
      }
    } else {
      navigate("/auth");
    }
  }, [location, navigate]);

  return <p>Logging you in...</p>;
};

export default AuthCompletePage;
