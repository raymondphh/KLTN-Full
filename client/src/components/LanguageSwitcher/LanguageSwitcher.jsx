import React from "react";
import { Select } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

/**
 * Drop this anywhere (Navbar, Login page, Settings...) — it's fully
 * self-contained and persists the choice to localStorage via the
 * i18next-browser-languagedetector cache configured in src/i18n/index.js.
 */
const LanguageSwitcher = ({ className = "" }) => {
  const { i18n } = useTranslation();

  return (
    <Select
      className={className}
      value={i18n.language?.startsWith("en") ? "en" : "vi"}
      onChange={(lng) => i18n.changeLanguage(lng)}
      options={LANGUAGES}
      suffixIcon={<GlobalOutlined />}
      size="middle"
      style={{ minWidth: 130 }}
      aria-label="Language"
    />
  );
};

export default LanguageSwitcher;
