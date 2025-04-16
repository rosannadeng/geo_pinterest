// src/pages/AuthCompletePage.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";
import Cookies from "js-cookie";

const AuthCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/user`, {
          withCredentials: true,
          headers: {
            "X-CSRFToken": Cookies.get("csrftoken"),
          },
        });

        if (res.status === 200) {
          setUser(res.data);
          setIsAuthenticated(true);
          navigate("/gallery");
        } else {
          console.error("User not authenticated, redirecting to /auth");
          navigate("/auth");
        }
      } catch (err) {
        console.error("Auth check error:", err);
        navigate("/auth");
      }
    };

    fetchUser();
  }, [location, navigate, setUser, setIsAuthenticated]);

  return <p>Logging you in...</p>;
};

export default AuthCompletePage;
