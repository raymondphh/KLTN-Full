import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css"; // AntD v5 base reset (kept separate from Tailwind, see tailwind.config.js)
import "./index.css";
import "./i18n"; // must be imported once, before anything that calls useTranslation()
import App from "./App";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    <ToastContainer />
  </React.StrictMode>,
);
