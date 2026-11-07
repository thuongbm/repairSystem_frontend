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

Các màn đang hoạt động nằm trong `src/features`, được nhóm theo nghiệp vụ: `auth`, `catalog`, `customer`, `dashboard`, `inventory`, `reception`, `repair` và `staff`. Route nằm trong `src/App.jsx`; API dùng chung nằm trong `src/services/api.js`. Các màn mẫu cũ được lưu tại `archive/legacy-ui` và không chạy trong ứng dụng hiện tại.

Giao diện V3 hiện có: khách chọn khung giờ còn chỗ và hủy lịch; lễ tân xác nhận lịch, liên kết phiếu và cấp mã liên kết hồ sơ cũ; Admin đặt lại mật khẩu; kho sửa mẫu và cấu hình loại linh kiện. Xem quy tắc API tại `Project1_backend/API_V3_COMPLETION.md`.

Xem [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) để biết cây thư mục và vị trí cần sửa khi thêm chức năng.

Các màn hiện có đã gọi API bổ sung V3: cổng khách xem phiếu, phản hồi báo giá,
đặt lịch và xem bảo hành; lễ tân xác nhận lịch, cấp mã liên kết tài khoản, điều phối
phiếu và quản lý ảnh; kỹ thuật viên xem/tải ảnh; thủ kho xử lý tồn sau bảo hành NCC.
Backend cần chạy migration `database_v3/BO_SUNG_API_20261106.sql` trên CSDL V3 cũ
trước khi dùng các thao tác này. Xem danh sách endpoint tại
`Project1_backend/API_BO_SUNG_20261106.md`.
Để sử dụng luồng KTV, CSDL cũ cần chạy tiếp `database_v3/BO_SUNG_QUY_TRINH_KTV_20261107.sql`.
Lễ tân tiếp nhận và phân công → KTV xác nhận nhận máy, ghi kết quả kiểm tra → lễ tân báo giá
→ khách đồng ý → KTV bắt đầu sửa. KTV bấm **Làm mới** trong phiếu để nhận trạng thái báo giá mới.

---

## 📜 Các câu lệnh thường dùng (Available Scripts)

- `npm run dev`: Chạy ứng dụng ở chế độ phát triển với Hot-Module-Replacement (HMR).
- `npm run build`: Đóng gói ứng dụng để chuẩn bị deploy (sản phẩm cuối nằm ở thư mục `dist`).
- `npm run lint`: Chạy ESLint để kiểm tra và phát hiện các lỗi cú pháp, format code.
- `npm run preview`: Chạy thử bản build production trên môi trường local.
