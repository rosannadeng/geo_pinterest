// src/pages/AuthCompletePage.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const AuthCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const handleAuthComplete = async () => {
      const params = new URLSearchParams(location.search);
      console.log("Location search params:", params);
      const userStr = params.get("user");

      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsAuthenticated(true);
          navigate("/gallery");
        } catch (error) {
          console.error("Error handling OAuth complete:", error);
          navigate("/auth");
        }
      } else {
        navigate("/auth");
      }
    };

    handleAuthComplete();
  }, [location, navigate, setUser, setIsAuthenticated]);

  return <p>Logging you in...</p>;
};

export default AuthCompletePage;
