# 📅 Hệ Thống Đặt Bàn - Hướng Dẫn Đầy Đủ

## 🎯 Tổng Quan

Hệ thống đặt bàn cho phép:
- ✅ Khách đặt bàn trước
- ✅ Đánh dấu bàn là "reserved" (đã đặt)
- ✅ Theo dõi khi khách đến
- ✅ Tạo Guest tự động khi khách đến
- ✅ Đánh dấu khách đã ngồi vào bàn
- ✅ Cập nhật trạng thái bàn tự động

---

## 🔄 Luồng Hoạt Động

### 1️⃣ **Khách Đặt Bàn** (Reservation Created)
```
Status: PENDING
Table Status: RESERVED
```

**Thông tin đặt bàn:**
- Tên khách hàng
- Số điện thoại
- Email (optional)
- Số lượng khách
- Ngày & giờ đặt
- Yêu cầu đặc biệt

**Hệ thống tự động:**
- ✅ Kiểm tra bàn có trống không
- ✅ Đánh dấu bàn là "reserved"
- ✅ Lưu thông tin đặt bàn

---

### 2️⃣ **Admin Xác Nhận** (Optional)
```
Status: PENDING → CONFIRMED
Table Status: RESERVED
```

Admin có thể xác nhận đặt bàn qua admin panel.

---

### 3️⃣ **Khách Đến** (Customer Arrives)
```
Status: CONFIRMED → ARRIVED
Table Status: RESERVED
Guest: Created ✅
```

**Khi admin click "Đánh dấu đã đến":**
- ✅ Tạo Guest mới với thông tin từ reservation
- ✅ Liên kết Guest với Reservation
- ✅ Lưu thời gian khách đến (arrivedAt)
- ✅ Guest có thể bắt đầu order

**Guest được tạo với:**
```typescript
{
  tableName: reservation.table.tableName,
  guestName: reservation.customerName,
  guestPhone: reservation.customerPhone,
  joinedAt: new Date()
}
```

---

### 4️⃣ **Khách Ngồi Vào Bàn** (Customer Seated)
```
Status: ARRIVED → SEATED
Table Status: OCCUPIED ✅
```

**Khi admin click "Đánh dấu đã ngồi":**
- ✅ Cập nhật trạng thái bàn thành "occupied"
- ✅ Lưu thời gian ngồi (seatedAt)
- ✅ Khách có thể order món

---

### 5️⃣ **Hoàn Thành** (Completed)
```
Status: SEATED → COMPLETED
Table Status: AVAILABLE ✅
```

**Khi hoàn thành:**
- ✅ Đánh dấu reservation hoàn thành
- ✅ Cập nhật bàn về "available"
- ✅ Lưu thời gian hoàn thành

---

## 🎨 Trạng Thái Reservation

| Status | Màu | Ý nghĩa | Table Status |
|--------|-----|---------|--------------|
| **pending** | 🟡 Amber | Chờ xác nhận | reserved |
| **confirmed** | 🔵 Blue | Đã xác nhận | reserved |
| **arrived** | 🟣 Purple | Đã đến | reserved |
| **seated** | 🟢 Green | Đã ngồi | occupied |
| **completed** | ⚪ Gray | Hoàn thành | available |
| **cancelled** | 🔴 Red | Đã hủy | available |
| **no_show** | 🟠 Orange | Không đến | available |

---

## 🔧 API Endpoints

### **Tạo Đặt Bàn**
```typescript
POST /reservations
{
  table: "tableId",
  customerName: "Nguyễn Văn A",
  customerPhone: "0123456789",
  numberOfGuests: 4,
  reservationDate: "2024-01-15",
  reservationTime: "19:00",
  specialRequests: "Gần cửa sổ"
}
```

### **Lấy Danh Sách**
```typescript
GET /reservations?page=1&limit=10&status=pending&date=2024-01-15
```

### **Đánh Dấu Đã Đến**
```typescript
PATCH /reservations/:id/arrived
// Tự động tạo Guest
```

### **Đánh Dấu Đã Ngồi**
```typescript
PATCH /reservations/:id/seated
// Cập nhật table status = occupied
```

### **Cập Nhật Trạng Thái**
```typescript
PATCH /reservations/:id/status
{
  status: "confirmed" | "cancelled" | "no_show" | "completed"
}
```

---

## 💻 Frontend Usage

### **Admin Panel**
```typescript
// Đánh dấu khách đã đến
await markReservationAsArrived(reservationId);
// → Tạo Guest tự động

// Đánh dấu khách đã ngồi
await markReservationAsSeated(reservationId);
// → Table status = occupied
```

### **Hiển Thị Danh Sách**
```typescript
const reservations = await getReservations(1, 10, 'pending');
```

### **Lọc Theo Ngày**
```typescript
const todayReservations = await getTodayReservations();
const upcomingReservations = await getUpcomingReservations(7);
```

---

## 🎯 Use Cases

### **Case 1: Khách Đặt Bàn Trước**
1. Khách gọi điện đặt bàn
2. Admin tạo reservation
3. Bàn được đánh dấu "reserved"
4. Khi khách đến → Click "Đã đến"
5. Guest được tạo tự động
6. Khách có thể order

### **Case 2: Khách Walk-in (Không Đặt Trước)**
1. Khách đến trực tiếp
2. Admin tạo Guest trực tiếp (không cần reservation)
3. Bàn được đánh dấu "occupied"
4. Khách order bình thường

### **Case 3: Khách Không Đến**
1. Reservation status = "pending"
2. Khách không đến
3. Admin đánh dấu "no_show"
4. Bàn được giải phóng về "available"

---

## 🔐 Permissions

```typescript
'reservation:create'      // Tạo đặt bàn
'reservation:findAll'     // Xem danh sách
'reservation:findOne'     // Xem chi tiết
'reservation:update'      // Cập nhật thông tin
'reservation:updateStatus' // Cập nhật trạng thái
'reservation:markArrived' // Đánh dấu đã đến
'reservation:markSeated'  // Đánh dấu đã ngồi
'reservation:delete'      // Xóa đặt bàn
```

---

## 📊 Database Schema

### **Reservation Collection**
```typescript
{
  _id: ObjectId,
  table: ObjectId (ref: Table),
  customerName: String,
  customerPhone: String,
  customerEmail: String?,
  numberOfGuests: Number,
  reservationDate: Date,
  reservationTime: String, // "HH:mm"
  status: Enum,
  specialRequests: String?,
  notes: String?,
  guest: ObjectId? (ref: Guest), // Tạo khi khách đến
  arrivedAt: Date?,
  seatedAt: Date?,
  completedAt: Date?,
  createdAt: Date,
  updatedAt: Date
}
```

### **Indexes**
```typescript
{ table: 1, reservationDate: 1 }
{ customerPhone: 1 }
{ status: 1 }
{ reservationDate: 1, reservationTime: 1 }
```

---

## 🚀 Deployment Steps

### **1. Backend**
```bash
cd agoda
npm run start:dev
```

### **2. Frontend**
```bash
cd v1
npm run dev
```

### **3. Access Admin Panel**
```
http://localhost:3000/admin/reservations
```

---

## ✅ Testing Checklist

- [ ] Tạo reservation mới
- [ ] Kiểm tra bàn được đánh dấu "reserved"
- [ ] Đánh dấu khách đã đến
- [ ] Kiểm tra Guest được tạo tự động
- [ ] Đánh dấu khách đã ngồi
- [ ] Kiểm tra bàn chuyển sang "occupied"
- [ ] Hoàn thành reservation
- [ ] Kiểm tra bàn về "available"
- [ ] Test các trường hợp hủy/no-show

---

## 🎉 Kết Luận

Hệ thống đặt bàn giờ đã hoàn chỉnh với:
- ✅ Đặt bàn trước
- ✅ Theo dõi trạng thái khách
- ✅ Tự động tạo Guest khi khách đến
- ✅ Quản lý trạng thái bàn tự động
- ✅ Admin panel đầy đủ tính năng

**Ready for production! 🚀**
