# 🚀 Express@5.1.0 + TypeScript Starter

👨‍💻 **Tác giả**: Đặng Hoàng Minh

## 📦 Dự án khởi đầu cho ứng dụng **Express.js** với **TypeScript**

Cấu trúc đã được thiết kế sẵn với:

- Hỗ trợ **ESM** và alias path (`@`)
- **Hot reload** với `nodemon`
- Hệ thống **logging** với `winston` (console & file log)
- Ghi log cả **HTTP request**, **database query** (MongoDB)
- Tự động sinh `_id` chuẩn MongoDB, tổ chức code rõ ràng

## 🧰 1. Cài đặt dự án

```bash
npm install
🔄 2. Chạy ở chế độ phát triển (dev mode - hot reload)
bash


npm run dev
Server sẽ chạy tại:
➡️ http://localhost:8080

🛠 3. Build & chạy production
bash


npm run build
npm start
📁 Cấu trúc thư mục
css


src/
├── configs/         # Cấu hình môi trường, logger, MongoDB client
├── models/          # Định nghĩa schema, kiểu dữ liệu
├── routers/         # Express routers
├── services/        # Tầng giao tiếp DB / nghiệp vụ
├── middlewares/     # Các middleware tùy chỉnh
├── utils/           # Helper / tiện ích dùng chung
└── index.ts         # Điểm khởi đầu của ứng dụng
✅ Đã tích hợp sẵn
 TypeScript

 Alias module (@/)

 Hot reload với nodemon

 Logger: console + file (chỉ ghi file ở production)

 Log truy vấn MongoDB (commandStarted, commandSucceeded, commandFailed)

 ESlint + Prettier

 4. File Log và Console Log
Tất cả log đều được ghi ra console khi chạy ở môi trường phát triển (NODE_ENV=development). Ở môi trường production, log cũng được ghi vào file, giúp dễ dàng theo dõi và quản lý trong môi trường thực tế.

Cấu hình này có thể được tùy chỉnh trong file configs/logger.js nếu bạn muốn thay đổi cách thức ghi log hoặc file lưu trữ.

🌍5. Thiết lập .env
Tạo file .env tại thư mục gốc check file .env_example để cấu hình lại


