import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Alert, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import axiosClient from "../api/axiosClient";
import LanguageSwitcher from "../components/LanguageSwitcher/LanguageSwitcher";

const { Title } = Typography;

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    setErrorMsg("");
    setLoading(true);
    try {
      const { data } = await axiosClient.post("/auth/login", values);
      const { token, user } = data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("code", user.code);
      localStorage.setItem("fullname", `${user.firstName} ${user.lastName}`);

      toast.success(data.message || t("auth.loginSuccess"));
      navigate("/");
    } catch (error) {
      const message = error.response?.data?.message || t("auth.genericError");
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <Card
        className="w-full max-w-sm shadow-lg rounded-2xl"
        bodyStyle={{ padding: 32 }}>
        <div className="text-center mb-6">
          <Title level={3} className="!mb-1">
            {t("auth.loginTitle")}
          </Title>
          <p className="text-slate-500 text-sm">{t("common.appName")}</p>
        </div>

        {errorMsg && (
          <Alert type="error" message={errorMsg} className="mb-4" showIcon />
        )}

        <Form
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
          requiredMark={false}>
          <Form.Item
            name="username"
            label={t("auth.username")}
            rules={[{ required: true, message: t("auth.usernameRequired") }]}>
            <Input
              prefix={<UserOutlined className="text-slate-400" />}
              size="large"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={t("auth.password")}
            rules={[{ required: true, message: t("auth.passwordRequired") }]}>
            <Input.Password
              prefix={<LockOutlined className="text-slate-400" />}
              size="large"
            />
          </Form.Item>

          <Form.Item className="!mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}>
              {t("auth.loginButton")}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
