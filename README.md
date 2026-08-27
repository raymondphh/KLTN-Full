# KLTN — Hệ thống Quản lý Khóa luận Tốt nghiệp

Hệ thống quản lý đăng ký, chấm điểm và theo dõi khóa luận tốt nghiệp cho sinh viên, giảng viên hướng dẫn và hội đồng chấm điểm. Xây dựng theo mô hình MERN (MongoDB, Express, React, Node.js).

## Mục lục

- [Tính năng](#tính-năng)
- [Kiến trúc & công nghệ](#kiến-trúc--công-nghệ)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Biến môi trường](#biến-môi-trường)
- [Chạy dự án](#chạy-dự-án)
- [Phân quyền theo vai trò](#phân-quyền-theo-vai-trò)
- [Tài liệu API](#tài-liệu-api)
- [Đa ngôn ngữ (i18n)](#đa-ngôn-ngữ-i18n)
- [Bảo mật](#bảo-mật)
- [Migration dữ liệu cũ](#migration-dữ-liệu-cũ)
- [Đóng góp](#đóng-góp)

## Tính năng

**Quản lý đề tài**

- Giảng viên tạo/sửa/xóa đề tài trong thời hạn cho phép (deadline-gated)
- Sinh viên đăng ký/hủy đăng ký đề tài, giới hạn theo số lượng slot
- Danh sách đề tài lọc theo học kỳ, giảng viên, từ khóa, có phân trang

**Chấm điểm hội đồng**

- Mỗi thành viên hội đồng (chủ tịch, phản biện, thư ký, ủy viên, GVHD) chấm điểm độc lập cho vai trò của mình
- Điểm cuối cùng tự động tính theo trọng số từng vai trò, không bị ghi đè lẫn nhau

**Tài khoản & bảo mật**

- Đăng nhập bằng access token (JWT, sống ngắn) + refresh token (httpOnly cookie, tự động xoay vòng)
- Quên mật khẩu / đặt lại mật khẩu qua email
- Phân quyền theo vai trò: `admin`, `teacher`, `student`

**Thông báo**

- Thông báo real-time qua Socket.io khi có đề tài mới, deadline mới, cập nhật hồ sơ
- Đánh dấu đã đọc, xóa thông báo đã đọc

**Quản trị**

- Quản lý người dùng, học kỳ (`Semester`), deadline đăng ký
- Nhật ký thao tác (audit log) cho các hành động quan trọng (xóa đề tài, chấm điểm...)
- Báo cáo tổng hợp toàn hệ thống, tìm kiếm, xuất dữ liệu

**Giao diện**

- Đa ngôn ngữ Việt/Anh (đồng bộ cả giao diện lẫn thông báo lỗi từ server)
- Dark mode
- Responsive, dùng chung design system Ant Design + Tailwind CSS

## Kiến trúc & công nghệ

### Backend (`server/`)

| Thành phần               | Công nghệ                                                            |
| ------------------------ | -------------------------------------------------------------------- |
| Runtime                  | Node.js 20, Express 4                                                |
| Database                 | MongoDB + Mongoose                                                   |
| Xác thực                 | JWT (access token) + refresh token xoay vòng lưu DB, httpOnly cookie |
| Validate input           | `express-validator`                                                  |
| Validate biến môi trường | `zod` (fail-fast nếu thiếu `.env`)                                   |
| Chống NoSQL injection    | `express-mongo-sanitize`                                             |
| Bảo mật HTTP header      | `helmet`                                                             |
| Giới hạn tần suất        | `express-rate-limit` (riêng cho `/auth/*`)                           |
| Realtime                 | `socket.io`                                                          |
| Gửi email                | `nodemailer`                                                         |
| Logging                  | `winston` (ghi file `logs/error.log`, `logs/combined.log`)           |
| Đa ngôn ngữ API          | `i18next` + `i18next-http-middleware`                                |

**Kiến trúc code**: mỗi module theo layer rõ ràng —

```
routes/  →  validators/  →  controllers/  →  services/  →  models/
```

`controllers` chỉ điều phối request/response, toàn bộ business logic nằm ở `services`, giúp dễ test và tái sử dụng.

### Frontend (`client/`)

| Thành phần    | Công nghệ                                                                       |
| ------------- | ------------------------------------------------------------------------------- |
| Framework     | React 18 (Create React App)                                                     |
| UI Components | Ant Design 5                                                                    |
| Styling       | Tailwind CSS (chỉ dùng utility classes, tắt `preflight` để không xung đột AntD) |
| Định tuyến    | `react-router-dom`                                                              |
| Gọi API       | `axios` (tự động refresh access token khi hết hạn)                              |
| Đa ngôn ngữ   | `react-i18next`                                                                 |
| Realtime      | `socket.io-client`                                                              |
| Thông báo UI  | `react-toastify`                                                                |

## Cấu trúc thư mục

```
KLTN-Full/
├── server/
│   ├── config/          # env validation (zod), db connection, logger
│   ├── controllers/      # điều phối request/response
│   ├── services/         # business logic
│   ├── models/           # Mongoose schemas
│   ├── validators/       # express-validator rules
│   ├── middlewares/       # auth, error handler, validate
│   ├── routes/
│   ├── realtime/          # Socket.io setup
│   ├── i18n/ locales/     # message keys en/vi
│   ├── cronJobs/ scheduler/
│   └── index.js
└── client/
    ├── src/
    │   ├── api/           # axios client (refresh-token flow)
    │   ├── components/     # component dùng chung (LanguageSwitcher, ThemeToggle...)
    │   ├── pages/          # từng trang (Login, Thesis, Admin, Council...)
    │   ├── i18n/ locales/  # message keys en/vi
    │   ├── context/        # ThemeContext (dark mode)
    │   └── App.js
    └── public/
```

## Yêu cầu hệ thống

- Node.js ≥ 20
- MongoDB ≥ 6 (local hoặc MongoDB Atlas)
- Tài khoản SMTP để gửi email đặt lại mật khẩu (Gmail App Password dùng được cho môi trường dev)

## Cài đặt

```bash
git clone <repo-url>
cd KLTN-Full

# Backend
cd server
npm install

# Frontend — react-scripts (CRA) hiện xung đột peer-dependency với vài gói mới
# (xem file client/.npmrc), luôn cài bằng:
cd ../client
npm install
```

`client/.npmrc`:

```
legacy-peer-deps=true
```

## Biến môi trường

Copy `server/.env.example` thành `server/.env` và điền giá trị thật. **Server sẽ từ chối khởi động** nếu thiếu hoặc sai định dạng bất kỳ biến nào dưới đây (validate bằng `zod` trong `config/env.js`).

```env
NODE_ENV=development
PORT=6001

MONGO_URL=mongodb://localhost:27017/kltn

# Sinh bằng: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=
JWT_ACCESS_TTL=15m
REFRESH_TOKEN_SECRET=
JWT_REFRESH_TTL_DAYS=30

CLIENT_URL=http://localhost:3000
COOKIE_DOMAIN=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@thesis-management.local
```

> `JWT_SECRET` và `REFRESH_TOKEN_SECRET` phải khác nhau và tối thiểu 32 ký tự.

`client/.env` (tùy chọn, mặc định đã có trong `src/constans.js`):

```env
REACT_APP_SERVER_URL=http://localhost:6001
```

## Chạy dự án

```bash
# Terminal 1 — backend
cd server
npm run dev        # nodemon, hot-reload

# Terminal 2 — frontend
cd client
npm start           # http://localhost:3000
```

Kiểm tra backend đã chạy: `GET http://localhost:6001/health` → `{ "status": "ok" }`

### Chạy test

```bash
cd server
npm test
```

## Phân quyền theo vai trò

| Vai trò   | Quyền hạn chính                                                                                          |
| --------- | -------------------------------------------------------------------------------------------------------- |
| `admin`   | Quản lý người dùng, học kỳ, deadline; xem báo cáo tổng hợp và audit log                                  |
| `teacher` | Tạo/sửa/xóa đề tài của mình (trong hạn); xem sinh viên đã đăng ký; chấm điểm hội đồng nếu được phân công |
| `student` | Đăng ký/hủy đăng ký đề tài (trong hạn); nộp link báo cáo/sản phẩm                                        |

Phân quyền được kiểm tra ở **tầng route** (`middlewares/auth.js` — `verifyToken` + `requireRole(...)`), không dựa vào việc ẩn/hiện ở giao diện.

## Tài liệu API

Tất cả response đi theo cấu trúc thống nhất:

```json
{ "success": true, "message": "...", "data": {} }
```

Lỗi:

```json
{ "success": false, "message": "...", "errors": [] }
```

| Nhóm            | Base path        | Ghi chú                                                                       |
| --------------- | ---------------- | ----------------------------------------------------------------------------- |
| Xác thực        | `/auth`          | `login`, `register`, `refresh`, `logout`, `forgot-password`, `reset-password` |
| Đề tài          | `/theses`        | CRUD + đăng ký/hủy đăng ký                                                    |
| Người dùng      | `/users`         | Admin quản lý; `teacher` list dùng chung cho picker                           |
| Học kỳ          | `/semesters`     | Tạo, đặt học kỳ hiện tại                                                      |
| Deadline        | `/deadlines`     | Tạo (admin), lấy deadline đang hoạt động theo vai trò                         |
| Hồ sơ sinh viên | `/status`        | Cập nhật hội đồng, chấm điểm (`/status/score`), nộp link                      |
| Thông báo       | `/notifications` | Danh sách, đánh dấu đã đọc, xóa đã đọc                                        |
| Báo cáo         | `/report`        | Admin — báo cáo tổng hợp toàn hệ thống                                        |
| Audit log       | `/audit-logs`    | Admin — lịch sử thao tác                                                      |

Ngôn ngữ phản hồi (message lỗi/thành công) được xác định qua header `Accept-Language: vi|en` hoặc query `?lang=vi|en`; axios client ở FE tự gắn header này theo ngôn ngữ đang chọn.

## Đa ngôn ngữ (i18n)

- **Backend**: `server/locales/{en,vi}.json` — message key resolve qua `req.t(key)`, mặc định `vi`.
- **Frontend**: `client/src/i18n/locales/{en,vi}.json` — dùng hook `useTranslation()` của `react-i18next`, lựa chọn ngôn ngữ lưu ở `localStorage` (`i18nextLng`).
- Khi thêm tính năng mới, luôn thêm key ở **cả 2 file** (`en.json` + `vi.json`) tương ứng phía đã sửa (BE hoặc FE).

## Bảo mật

- Access token (JWT) sống ngắn (15 phút), refresh token là chuỗi ngẫu nhiên (không phải JWT) lưu hash trong DB, xoay vòng mỗi lần refresh; phát hiện & vô hiệu hóa toàn bộ phiên nếu token bị tái sử dụng sau khi đã xoay (dấu hiệu bị đánh cắp).
- Refresh token truyền qua **httpOnly cookie**, không thể đọc bằng JavaScript (chống XSS đánh cắp token). Access token chỉ giữ trong bộ nhớ JS (không `localStorage`).
- Input được sanitize chống NoSQL injection (`express-mongo-sanitize`) trước khi vào bất kỳ query Mongoose nào.
- Mọi biến môi trường nhạy cảm được validate khi khởi động — server không bao giờ chạy với `JWT_SECRET` rỗng/`undefined`.
- Rate-limit riêng và chặt hơn cho các endpoint xác thực (`/auth/login`, `/auth/forgot-password`) để chống brute-force.
- Endpoint quên mật khẩu luôn trả cùng một thông điệp bất kể username có tồn tại hay không, tránh dò tài khoản (username enumeration).

## Migration dữ liệu cũ

Nếu nâng cấp từ phiên bản trước khi có `Semester` entity hoặc `studentQuantity` kiểu `Number`, chạy các script sau **một lần** rồi xóa:

```bash
node server/scripts/migrateStudentQuantity.js
node server/scripts/migrateSemester.js
```

## Đóng góp

1. Tạo nhánh từ `develop`: `feature/ten-tinh-nang`
2. Thêm test cho logic mới trong `services/` nếu có thể
3. Cập nhật i18n key ở cả `en.json` và `vi.json` tương ứng
4. Tạo Pull Request vào `develop`, mô tả rõ thay đổi

---

**License**: nội bộ / theo yêu cầu của trường — cập nhật nếu công khai mã nguồn.
