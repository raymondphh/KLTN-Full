import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * API-side i18n. The client tells us which language it wants by either:
 *  - sending `?lang=en` / `?lang=vi` on the request, or
 *  - sending an `Accept-Language: en` header
 * and every error/success message key (see /locales/en.json, vi.json)
 * is resolved through req.t(...) in controllers and the error handler.
 */
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "vi",
    preload: ["vi", "en"],
    supportedLngs: ["vi", "en"],
    backend: {
      loadPath: path.join(__dirname, "../locales/{{lng}}.json"),
    },
    detection: {
      order: ["querystring", "header"],
      lookupQuerystring: "lang",
      lookupHeader: "accept-language",
      caches: false,
    },
    interpolation: { escapeValue: false },
  });

export const i18nMiddleware = middleware.handle(i18next);
export default i18next;
