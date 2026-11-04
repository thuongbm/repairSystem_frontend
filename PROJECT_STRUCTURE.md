# Cấu trúc Frontend hiện tại

Ứng dụng dùng React và Vite. `src/App.jsx` là nơi khai báo các route và quyền truy cập. Mã nghiệp vụ đang chạy được nhóm theo tính năng trong `src/features`.

```text
RepairFrontend/
├── src/
│   ├── App.jsx                     # Route đang sử dụng
│   ├── assets/                     # Ảnh, SVG
│   ├── components/                 # Layout và route bảo vệ dùng chung
│   ├── context/                    # Trạng thái đăng nhập và hook useAuth
│   ├── features/
│   │   ├── auth/                   # Đăng nhập, đăng ký khách
│   │   ├── catalog/                # Bảng giá dịch vụ
│   │   ├── customer/               # Cổng khách hàng
│   │   ├── dashboard/              # Tổng quan
│   │   ├── inventory/              # Kho, mẫu linh kiện, bảo hành NCC
│   │   ├── reception/              # Tiếp nhận, báo giá, thu ngân, bảo hành khách
│   │   ├── repair/                 # Bàn kỹ thuật, yêu cầu vật tư
│   │   └── staff/                  # Nhân sự và tài khoản
│   └── services/api.js             # Các lời gọi Backend
├── archive/legacy-ui/              # Màn mẫu cũ, không được App.jsx sử dụng
├── public/                         # Tệp phục vụ trực tiếp
├── package.json
└── vite.config.js
```

## Cách tìm và thêm chức năng

- Route và quyền: `src/App.jsx`, `src/components/ProtectedRoute.jsx`.
- Menu: `src/components/Layout/MainLayout.jsx`.
- Giao diện một nghiệp vụ: thư mục tương ứng trong `src/features`; đặt component chỉ dùng cho nghiệp vụ đó bên cạnh trang của nó.
- Lời gọi API dùng chung: `src/services/api.js`.
- Trạng thái đăng nhập: `src/context/AuthProvider.jsx`, `src/context/authContext.js`, `src/context/useAuth.js`.

Các trang trong `archive/legacy-ui` chỉ để tham khảo. Nếu cần dùng lại, kiểm tra và cập nhật import cũng như API trước khi đưa chúng vào route.

## Kiểm tra

```powershell
npm install
npm run lint
npm run build
npm run dev
```
