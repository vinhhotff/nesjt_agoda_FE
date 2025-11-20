# 🍽️ Hệ Thống Đặt Bàn - Hướng Dẫn

## Tổng Quan

Hệ thống đặt bàn cho phép khách hàng:
- Đặt bàn trực tiếp (miễn phí, không chọn bàn cụ thể)
- Chọn bàn cụ thể và thanh toán đặt cọc 300,000 VND qua PayOS

## Luồng Hoạt Động

### 1. Khách Hàng Đặt Bàn

**Trang:** `/reservation`

**Hai Loại Đặt Bàn:**

#### A. Đặt Bàn Thường (Miễn Phí)
- Khách điền thông tin: tên, số điện thoại, email, ngày giờ, số người
- Không chọn bàn cụ thể
- Gửi yêu cầu → Nhà hàng sẽ liên hệ xác nhận

#### B. Đặt Bàn Có Chọn Vị Trí (Có Phí)
- Khách điền đầy đủ thông tin
- Bấm "Select Table" → Mở modal chọn bàn
- Chọn bàn cụ thể từ layout
- Thanh toán 300,000 VND qua PayOS
- Sau khi thanh toán thành công → Tự động tạo reservation

### 2. Modal Chọn Bàn

**Component:** `TableSelectionModal`

**Tính Năng:**
- Hiển thị layout bàn theo lưới (grid)
- Màu sắc trạng thái:
  - 🟢 Xanh lá: Bàn trống, có thể chọn
  - 🟡 Vàng: Bàn đã đặt nhưng vẫn có thể chọn
  - 🔴 Đỏ: Bàn đã được chọn bởi người khác
  - ⚫ Xám: Bàn đang bảo trì
  - 🟠 Cam: Bàn bạn đã chọn

**Auto-Generate Layout:**
- Nếu admin chưa tạo layout, hệ thống tự động tạo layout mặc định
- Layout mặc định sắp xếp bàn theo lưới 4 bàn/hàng
- Mỗi bàn chiếm 2x2 ô với khoảng cách 1 ô

### 3. Admin Quản Lý Layout

**Trang:** `/admin/tables/layout`

**Tính Năng:**
- Tạo layout mới
- Kéo thả bàn vào vị trí mong muốn
- Xoay bàn (0°, 90°, 180°, 270°)
- Thay đổi kích thước bàn
- Tạo zones (khu vực)
- Lưu layout vào localStorage

**Cách Sử Dụng:**
1. Vào `/admin/tables/layout`
2. Bấm "Create Layout" hoặc chỉnh sửa layout hiện có
3. Kéo bàn từ danh sách vào grid
4. Điều chỉnh vị trí, xoay, kích thước
5. Bấm "Save Layout"

### 4. Thanh Toán PayOS

**Luồng:**
1. Khách chọn bàn → Bấm "Pay 300k to Reserve Table"
2. Tạo pending reservation trong localStorage
3. Redirect đến PayOS payment page
4. Khách thanh toán
5. PayOS callback về `/payment/reservation-callback`
6. Tạo reservation trong database
7. Hiển thị thông báo thành công

**Callback Handler:**
- Kiểm tra payment status
- Lấy pending reservation từ localStorage
- Gọi API tạo reservation
- Xóa pending reservation
- Redirect về trang success/cancel

## Cấu Trúc Dữ Liệu

### TableLayout
```typescript
interface TableLayout {
  _id?: string;
  name: string;
  gridCols: number;  // Số cột trong grid
  gridRows: number;  // Số hàng trong grid
  tables: {
    tableId: string;
    tableName: string;
    position: { x: number; y: number; rotation?: number };
    width?: number;   // Số ô chiếm theo chiều ngang
    height?: number;  // Số ô chiếm theo chiều dọc
  }[];
  zones?: {
    zoneId: string;
    zoneName: string;
    bounds: { x1: number; y1: number; x2: number; y2: number };
  }[];
}
```

### Reservation
```typescript
interface CreateReservationDto {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reservationDate: string;  // ISO format: "2025-11-20T15:50:00"
  numberOfGuests: number;
  specialRequests?: string;
  tableNumber?: string;     // Nếu có chọn bàn
}
```

## Storage

### localStorage Keys

1. **`table-layouts`**: Array of TableLayout
   - Lưu tất cả layouts
   - Layout đầu tiên là active layout

2. **`pending_reservation`**: Pending reservation data
   - Lưu tạm khi chờ thanh toán
   - Xóa sau khi thanh toán thành công/thất bại

## API Endpoints

### Public (Không cần auth)
- `POST /api/v1/reservations/public` - Tạo reservation (không chọn bàn)
- `GET /api/v1/tables` - Lấy danh sách bàn

### Protected (Cần auth)
- `POST /api/v1/reservations` - Tạo reservation (có chọn bàn, sau thanh toán)
- `GET /api/v1/reservations` - Lấy danh sách reservations
- `PATCH /api/v1/reservations/:id` - Cập nhật reservation

## Cải Tiến Đã Thực Hiện

### 1. Auto-Generate Default Layout
- Tự động tạo layout nếu admin chưa tạo
- Khách hàng không bị block khi chưa có layout

### 2. Improved UI/UX
- Modal chọn bàn đẹp hơn với màu sắc rõ ràng
- Legend giải thích trạng thái bàn
- Hover effects và animations
- Responsive design

### 3. Better Error Handling
- Hiển thị message rõ ràng khi không có bàn
- Loading states
- Toast notifications thống nhất

### 4. Toast System
- Custom toast utility với icons
- Gradient colors đồng bộ với theme
- Promise toast cho async operations

## Troubleshooting

### Vấn Đề: "Chưa có layout nào"
**Giải pháp:**
- Hệ thống sẽ tự động tạo layout mặc định
- Nếu vẫn lỗi, kiểm tra xem có bàn nào trong database không
- Admin có thể tạo layout thủ công tại `/admin/tables/layout`

### Vấn Đề: Không thấy bàn trong modal
**Giải pháp:**
- Kiểm tra API `/api/v1/tables` có trả về data không
- Kiểm tra localStorage có `table-layouts` không
- Clear localStorage và reload để tạo lại layout mặc định

### Vấn Đề: Thanh toán thành công nhưng không tạo reservation
**Giải pháp:**
- Kiểm tra localStorage có `pending_reservation` không
- Kiểm tra callback URL có đúng không
- Xem console log trong `/payment/reservation-callback`

## Next Steps

### Cải Tiến Tiếp Theo:
1. **Backend Storage cho Layouts**
   - Lưu layouts vào database thay vì localStorage
   - API CRUD cho layouts
   - Sync layouts giữa các devices

2. **Real-time Updates**
   - WebSocket để update trạng thái bàn real-time
   - Notify khi bàn được chọn bởi người khác

3. **Advanced Features**
   - Drag & drop trong modal chọn bàn
   - Filter bàn theo capacity, zone
   - Calendar view cho reservations
   - Email confirmation
   - SMS notifications

4. **Analytics**
   - Thống kê bàn được chọn nhiều nhất
   - Revenue từ deposits
   - Conversion rate

## Files Liên Quan

### Components
- `v1/src/components/reservations/TableSelectionModal.tsx`
- `v1/src/components/admin/tables/TableLayoutEditor.tsx`

### Pages
- `v1/src/app/(homePage)/reservation/page.tsx`
- `v1/src/app/(pages)/admin/tables/layout/page.tsx`
- `v1/src/app/payment/reservation-callback/page.tsx`

### Utils
- `v1/src/lib/utils/defaultLayout.ts`
- `v1/src/lib/utils/toast.tsx`

### APIs
- `v1/src/lib/api/reservationsApi.ts`
- `v1/src/lib/api/payosApi.ts`
