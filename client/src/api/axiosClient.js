import axios from "axios";
import i18n from "../i18n";
import { SERVER_URL } from "../constans";

const axiosClient = axios.create({ baseURL: SERVER_URL });

// Attach auth token + current language on every request so backend error
// messages (see server/locales/*.json) come back in the same language
// the user has selected in the UI.
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["Accept-Language"] = i18n.language || "vi";
  return config;
});

export default axiosClient;
