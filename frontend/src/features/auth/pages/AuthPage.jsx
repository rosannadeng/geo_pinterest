import React, { useState } from "react";
import {
  Tabs,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  message,
} from "antd";
import {
  LockOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useAuth } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import auth from "../auth";
const { Title } = Typography;

const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [registerErrors, setRegisterErrors] = useState({});
  const [loginErrors, setLoginErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const onLogin = async (values) => {
    setLoading(true);
    setLoginErrors({}); // Clear previous errors
    try {
      const success = await login(values);
      if (success) {
        message.success("Login successful");
        navigate("/gallery");
      } else {
        setLoginErrors({ general: "Login failed, please check your username and password" });
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setLoginErrors(error.response.data.errors);
      } else {
        setLoginErrors({ general: "Network error, please try again later" });
      }
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values) => {
    setLoading(true);
    setRegisterErrors({}); // Clear previous errors
    try {
      if (!values.username || !values.email || !values.password) {
        setRegisterErrors({ general: "Please fill in all fields" });
        setLoading(false);
        return;
      }

      const registerData = {
        username: values.username,
        email: values.email,
        password: values.password,
        confirm_password: values.password, 
        firstname: values.firstname, 
        lastname: values.lastname 
      };

      const response = await auth.register(registerData);
      if (response.data) {
        message.success("Registration successful, please login");
        if (response.data.redirect_url) {
          window.location.href = response.data.redirect_url;
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response?.data?.errors) {
        setRegisterErrors(error.response.data.errors);
      } else if (error.response?.data?.error) {
        setRegisterErrors({ general: error.response.data.error });
      } else {
        setRegisterErrors({ general: "Registration failed, please try again" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "20px" }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Welcome to Map Art Community
      </Title>
      <Tabs defaultActiveKey="login">
        <Tabs.TabPane tab="Login" key="login">
          {Object.keys(loginErrors).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {Object.entries(loginErrors).map(([field, error]) => (
                <div key={field} style={{ color: 'red', marginBottom: 8 }}>
                  {field === 'general' ? error : `${field}: ${error}`}
                </div>
              ))}
            </div>
          )}
          <Form onFinish={onLogin}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Please enter your username" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Login
              </Button>
            </Form.Item>
          </Form>
          <Divider>Or</Divider>
          <GoogleLoginButton />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Register" key="register">
          <Form onFinish={onRegister}>
            <Form.Item
              name="username"
              rules={[{ required: true, message: "Please enter your username" }]}
              validateStatus={registerErrors.username ? "error" : ""}
              help={registerErrors.username}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email address" },
              ]}
              validateStatus={registerErrors.email ? "error" : ""}
              help={registerErrors.email}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
              validateStatus={registerErrors.password ? "error" : ""}
              help={registerErrors.password}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>
            <Form.Item
              name="confirm_password"
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
              validateStatus={registerErrors.confirm_password ? "error" : ""}
              help={registerErrors.confirm_password}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
            </Form.Item>
            <Form.Item
              name="firstname"
              rules={[{ required: true, message: "Please enter your first name" }]}
              validateStatus={registerErrors.firstname ? "error" : ""}
              help={registerErrors.firstname}
            >
              <Input prefix={<UserOutlined />} placeholder="First Name" />
            </Form.Item>
            <Form.Item
              name="lastname"
              rules={[{ required: true, message: "Please enter your last name" }]}
              validateStatus={registerErrors.lastname ? "error" : ""}
              help={registerErrors.lastname}
            >
              <Input prefix={<UserOutlined />} placeholder="Last Name" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Register
              </Button>
            </Form.Item>
          </Form>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default AuthPage;
