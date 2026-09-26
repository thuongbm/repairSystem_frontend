# Repair System - Frontend

Đây là dự án Frontend cho hệ thống **Repair System**, được xây dựng bằng [React](https://react.dev/) và công cụ build [Vite](https://vitejs.dev/) giúp mang lại trải nghiệm phát triển siêu tốc.

## 🛠 Công nghệ sử dụng
- **Core:** React 19
- **Build Tool:** Vite
- **HTTP Client:** Axios (cấu hình sẵn tại `src/services/api.js`)
- **Linter:** ESLint

---

## ⚙️ Yêu cầu môi trường (Prerequisites)
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:
- [Node.js](https://nodejs.org/) (Khuyến nghị sử dụng phiên bản **18.x** trở lên)
- `npm` (đã được cài đặt kèm sẵn khi bạn cài Node.js)

---

## 🚀 Hướng dẫn cài đặt và chạy dự án

Làm theo các bước sau để khởi tạo và chạy dự án trên máy tính của bạn:

### 1. Clone dự án về máy
Mở terminal và chạy lệnh sau để tải source code về máy, sau đó di chuyển vào thư mục dự án:
```bash
git clone <repository_url>
cd RepairFrontend
```

### 2. Cài đặt thư viện (Dependencies)
Thực thi lệnh sau để cài đặt các package cần thiết:
```bash
npm install
```

### 3. Khởi chạy server phát triển (Development)
Sau khi cài đặt xong thư viện, bạn chạy ứng dụng bằng lệnh:
```bash
npm run dev
```
> 🎉 Terminal sẽ hiển thị đường link local (thường là `http://localhost:5173`). Bạn giữ phím **Ctrl + Click** vào đường dẫn đó hoặc mở trình duyệt web và dán link vào để xem giao diện.

---

## 📂 Cấu trúc thư mục (Project Structure)

Dự án được tổ chức theo tiêu chuẩn của một ứng dụng React chuyên nghiệp giúp dễ dàng bảo trì và mở rộng:

```text
RepairFrontend/
├── public/              # Chứa các tài nguyên tĩnh không qua build process (favicon...)
├── src/
│   ├── assets/          # Hình ảnh, icon, font chữ (logo, svg...)
│   ├── components/      # Các component dùng chung (Button, Table, Modal...)
│   ├── context/         # Quản lý state toàn cục với Context API
│   ├── hooks/           # Custom React Hooks
│   ├── pages/           # Các component đóng vai trò là một trang (Home, Login...)
│   ├── services/        # Logic gọi API backend (chứa file api.js)
│   ├── utils/           # Các hàm tiện ích, format dữ liệu...
│   ├── App.jsx          # Component gốc
│   └── main.jsx         # Entry point của React
└── package.json         # Danh sách thư viện và config của npm
```

---

## 📜 Các câu lệnh thường dùng (Available Scripts)

- `npm run dev`: Chạy ứng dụng ở chế độ phát triển với Hot-Module-Replacement (HMR).
- `npm run build`: Đóng gói ứng dụng để chuẩn bị deploy (sản phẩm cuối nằm ở thư mục `dist`).
- `npm run lint`: Chạy ESLint để kiểm tra và phát hiện các lỗi cú pháp, format code.
- `npm run preview`: Chạy thử bản build production trên môi trường local.