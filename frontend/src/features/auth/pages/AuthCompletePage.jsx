// src/pages/AuthCompletePage.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AuthCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");
    const userStr = params.get("user");

    if (access && refresh && userStr) {
      try {
        const user = JSON.parse(userStr);
        localStorage.setItem("token", access);
        localStorage.setItem("refreshToken", refresh);
        localStorage.setItem("user", JSON.stringify(user));
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
