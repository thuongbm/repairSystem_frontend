# RepairFrontend

Frontend application for the Repair System, built with [React](https://react.dev/) and [Vite](https://vitejs.dev/).

## Cấu trúc thư mục

- Toàn bộ source code chính của ứng dụng nằm trong thư mục `Repair-Frontend`.
- Dự án sử dụng `npm` làm package manager.

## Yêu cầu môi trường (Prerequisites)

Trước khi chạy dự án, hãy đảm bảo máy tính của bạn đã cài đặt:
- [Node.js](https://nodejs.org/) (khuyến nghị phiên bản 18.x trở lên)
- `npm` (đã được cài đặt sẵn cùng với Node.js)

## Hướng dẫn cài đặt và chạy dự án (Getting Started)

Làm theo các bước sau để khởi tạo và chạy dự án trên máy tính của bạn:

### 1. Clone repository về máy
```bash
git clone <repository_url>
cd RepairFrontend
```

### 2. Di chuyển vào thư mục code chính
Dự án React được đặt trong thư mục `Repair-Frontend`, nên bạn cần truy cập vào thư mục này:
```bash
cd Repair-Frontend
```

### 3. Cài đặt các thư viện phụ thuộc (Dependencies)
```bash
npm install
```

### 4. Khởi chạy server development
```bash
npm run dev
```

Sau khi chạy lệnh trên, terminal sẽ hiển thị một đường link (thường là `http://localhost:5173`). Hãy mở đường link này bằng trình duyệt để xem giao diện web.

## Các câu lệnh khác (Available Scripts)

Trong thư mục `Repair-Frontend`, bạn có thể chạy các câu lệnh sau:

- **`npm run dev`**: Chạy ứng dụng ở chế độ development.
- **`npm run build`**: Build ứng dụng để chuẩn bị cho production. Kết quả sẽ được xuất ra thư mục `dist`.
- **`npm run lint`**: Kiểm tra lỗi cú pháp và code style bằng ESLint.
- **`npm run preview`**: Chạy thử bản build production trên server local.
