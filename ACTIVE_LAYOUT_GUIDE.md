# 🎯 Hệ Thống Layout Chính - Hướng Dẫn

## Tổng Quan

Hệ thống cho phép admin tạo nhiều layouts khác nhau và chọn một layout làm **Layout Chính** để hiển thị cho khách hàng khi đặt bàn.

## Tính Năng Mới

### 1. Multiple Layouts
- Admin có thể tạo nhiều layouts khác nhau
- Mỗi layout có thể có cấu hình riêng:
  - Kích thước grid khác nhau
  - Vị trí bàn khác nhau
  - Zones (khu vực) khác nhau
  - Số lượng bàn khác nhau

### 2. Active Layout (Layout Chính)
- Chỉ có **MỘT** layout được đánh dấu là "Layout Chính" tại một thời điểm
- Layout chính được hiển thị cho khách hàng trên trang `/reservation`
- Layout chính có badge vàng **"LAYOUT CHÍNH"** với icon ngôi sao
- Layout chính có border vàng và ring effect

### 3. Set Active Layout
- Admin có thể chuyển đổi layout chính bất cứ lúc nào
- Bấm nút **"Đặt làm layout chính"** trên layout muốn active
- Hệ thống tự động:
  - Set layout được chọn thành `isActive: true`
  - Set tất cả layouts khác thành `isActive: false`
  - Hiển thị toast notification xác nhận

## Giao Diện

### Layout Card

#### Layout Chính (Active)
```
┌─────────────────────────────────────────────────────┐
│ 🟡 BORDER VÀNG + RING EFFECT                        │
│                                                      │
│  Layout 1  [⭐ LAYOUT CHÍNH]                        │
│  Mô tả layout...                                    │
│                                                      │
│  Grid: 12 x 10  |  Bàn: 8  |  Khu: 2               │
│  Bàn: [T1] [T2] [T3] [T4] [T5] +3 bàn khác        │
│                                                      │
│                                          [✏️] [🗑️]  │
└─────────────────────────────────────────────────────┘
```

#### Layout Không Active
```
┌─────────────────────────────────────────────────────┐
│ ⚪ BORDER XÁM                                        │
│                                                      │
│  Layout 2                                           │
│  Mô tả layout...                                    │
│                                                      │
│  Grid: 8 x 10  |  Bàn: 4  |  Khu: 1                │
│  Bàn: [A1] [A2] [A3] [A4]                          │
│                                                      │
│  [✓ Đặt làm layout chính]                          │
│  Layout chính sẽ được hiển thị cho khách hàng...   │
│                                                      │
│                                          [✏️] [🗑️]  │
└─────────────────────────────────────────────────────┘
```

### Info Card
Hiển thị ở đầu trang khi có layouts:
```
┌─────────────────────────────────────────────────────┐
│ 🔵 INFO CARD                                        │
│                                                      │
│  ⭐ Layout Chính                                    │
│                                                      │
│  Layout được đánh dấu "LAYOUT CHÍNH" sẽ được       │
│  hiển thị cho khách hàng khi họ đặt bàn...         │
│                                                      │
│  💡 Mẹo: Bấm "Đặt làm layout chính" để thay đổi    │
└─────────────────────────────────────────────────────┘
```

## Use Cases

### 1. Layout Ngày Thường vs Cuối Tuần
**Scenario:** Nhà hàng có cấu hình bàn khác nhau cho ngày thường và cuối tuần

**Giải pháp:**
1. Tạo "Layout Ngày Thường" với 20 bàn
2. Tạo "Layout Cuối Tuần" với 30 bàn (thêm bàn ngoài trời)
3. Thứ 2-5: Set "Layout Ngày Thường" làm active
4. Thứ 6-CN: Set "Layout Cuối Tuần" làm active

### 2. Layout Sự Kiện Đặc Biệt
**Scenario:** Nhà hàng tổ chức sự kiện với cấu hình bàn đặc biệt

**Giải pháp:**
1. Tạo "Layout Sự Kiện" với bàn dài, sân khấu
2. Trước sự kiện: Set "Layout Sự Kiện" làm active
3. Sau sự kiện: Chuyển về "Layout Thường Ngày"

### 3. Layout Theo Mùa
**Scenario:** Nhà hàng có khu vực ngoài trời chỉ mở vào mùa hè

**Giải pháp:**
1. Tạo "Layout Mùa Hè" (có khu ngoài trời)
2. Tạo "Layout Mùa Đông" (chỉ trong nhà)
3. Chuyển đổi theo mùa

### 4. Testing Layout Mới
**Scenario:** Admin muốn test layout mới trước khi áp dụng

**Giải pháp:**
1. Giữ layout hiện tại làm active
2. Tạo layout mới để test
3. Khi hài lòng, set layout mới làm active

## Cấu Trúc Dữ Liệu

### TableLayout Interface
```typescript
interface TableLayout {
  _id?: string;
  name: string;
  gridCols: number;
  gridRows: number;
  isActive?: boolean;  // 🆕 Flag đánh dấu layout chính
  zones?: {
    zoneId: string;
    zoneName: string;
    bounds: { x1: number; y1: number; x2: number; y2: number };
  }[];
  tables: {
    tableId: string;
    tableName: string;
    position: { x: number; y: number; rotation?: number };
    width?: number;
    height?: number;
    zoneName?: string;
    type?: string;
    capacity?: number;
  }[];
  backgroundImage?: string;
  description?: string;
}
```

### localStorage Structure
```json
{
  "table-layouts": [
    {
      "_id": "1234567890",
      "name": "Layout Ngày Thường",
      "isActive": true,  // ← Layout chính
      "gridCols": 12,
      "gridRows": 10,
      "tables": [...]
    },
    {
      "_id": "0987654321",
      "name": "Layout Cuối Tuần",
      "isActive": false,  // ← Layout không active
      "gridCols": 12,
      "gridRows": 12,
      "tables": [...]
    }
  ]
}
```

## Logic Flow

### 1. Tạo Layout Mới
```
Admin bấm "Tạo layout mới"
  ↓
Mở TableLayoutEditor
  ↓
Admin thiết kế layout
  ↓
Bấm "Save"
  ↓
Nếu là layout đầu tiên:
  → Set isActive = true
Nếu không:
  → Set isActive = false
  ↓
Lưu vào localStorage
```

### 2. Set Active Layout
```
Admin bấm "Đặt làm layout chính" trên Layout B
  ↓
Loop qua tất cả layouts:
  - Layout B: isActive = true
  - Các layout khác: isActive = false
  ↓
Lưu vào localStorage
  ↓
Hiển thị toast: "Đã đặt layout chính thành công!"
  ↓
UI update:
  - Layout B: Hiển thị badge "LAYOUT CHÍNH"
  - Layout B: Border vàng + ring effect
  - Layouts khác: Hiển thị nút "Đặt làm layout chính"
```

### 3. Load Layout Cho Khách Hàng
```
Khách hàng mở modal chọn bàn
  ↓
TableSelectionModal load layouts từ localStorage
  ↓
Tìm layout có isActive = true
  ↓
Nếu tìm thấy:
  → Hiển thị layout đó
Nếu không tìm thấy:
  → Fallback: Lấy layout đầu tiên
Nếu không có layout nào:
  → Tự động tạo default layout với isActive = true
  ↓
Hiển thị grid bàn cho khách hàng
```

### 4. Xóa Layout
```
Admin bấm nút xóa trên Layout X
  ↓
Kiểm tra: Layout X có phải layout chính?
  ↓
Nếu CÓ:
  → Disable nút xóa
  → Tooltip: "Không thể xóa layout chính"
Nếu KHÔNG:
  → Hiển thị confirm dialog
  → Xóa layout khỏi array
  → Lưu vào localStorage
```

## UI Components

### Badge "LAYOUT CHÍNH"
```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold rounded-full shadow-md">
  <Star className="w-3.5 h-3.5 fill-current" />
  LAYOUT CHÍNH
</span>
```

### Nút "Đặt làm layout chính"
```tsx
<button
  onClick={() => handleSetActiveLayout(layout._id)}
  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105"
>
  <Check className="w-4 h-4" />
  Đặt làm layout chính
</button>
```

### Border Active Layout
```tsx
className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all ${
  layout.isActive 
    ? 'border-yellow-400 ring-2 ring-yellow-200' 
    : 'border-gray-200 hover:border-gray-300'
}`}
```

## Best Practices

### 1. Đặt Tên Layout Rõ Ràng
✅ Good:
- "Layout Ngày Thường"
- "Layout Cuối Tuần"
- "Layout Sự Kiện Tết"
- "Layout Mùa Hè (Có Ngoài Trời)"

❌ Bad:
- "Layout 1"
- "Test"
- "New Layout"

### 2. Thêm Mô Tả Chi Tiết
```typescript
{
  name: "Layout Cuối Tuần",
  description: "Bao gồm khu vực ngoài trời và bàn dài cho nhóm. Áp dụng từ 18:00 thứ 6 đến 23:00 chủ nhật."
}
```

### 3. Test Trước Khi Set Active
1. Tạo layout mới
2. Kiểm tra trong editor
3. Test với một vài bàn
4. Khi hài lòng → Set active

### 4. Backup Layout Cũ
- Không xóa layout cũ ngay
- Giữ lại để có thể rollback nếu cần

### 5. Thông Báo Cho Team
- Khi thay đổi layout chính
- Thông báo cho staff biết cấu hình mới

## Troubleshooting

### Vấn Đề: Không thấy badge "LAYOUT CHÍNH"
**Nguyên nhân:** Layout chưa được set isActive = true

**Giải pháp:**
1. Bấm "Đặt làm layout chính" trên layout muốn active
2. Hoặc edit localStorage:
```javascript
const layouts = JSON.parse(localStorage.getItem('table-layouts'));
layouts[0].isActive = true;
localStorage.setItem('table-layouts', JSON.stringify(layouts));
```

### Vấn Đề: Khách hàng thấy layout cũ
**Nguyên nhân:** Layout mới chưa được set active

**Giải pháp:**
- Vào `/admin/tables/layout`
- Bấm "Đặt làm layout chính" trên layout mới

### Vấn Đề: Không thể xóa layout
**Nguyên nhân:** Đang cố xóa layout chính

**Giải pháp:**
1. Set layout khác làm active trước
2. Sau đó mới xóa layout cũ

### Vấn Đề: Tất cả layouts đều không active
**Nguyên nhân:** Data bị corrupt hoặc migration

**Giải pháp:**
```javascript
// Fix script
const layouts = JSON.parse(localStorage.getItem('table-layouts'));
if (layouts && layouts.length > 0) {
  layouts[0].isActive = true;
  layouts.slice(1).forEach(l => l.isActive = false);
  localStorage.setItem('table-layouts', JSON.stringify(layouts));
}
```

## Future Enhancements

### 1. Schedule Active Layout
- Tự động chuyển layout theo lịch
- Ví dụ: Tự động chuyển sang "Layout Cuối Tuần" vào 18:00 thứ 6

### 2. Layout History
- Lưu lịch sử thay đổi layout
- Xem layout nào được active vào thời điểm nào

### 3. Layout Analytics
- Thống kê layout nào được sử dụng nhiều nhất
- Conversion rate theo layout

### 4. Layout Templates
- Thư viện templates có sẵn
- Import/Export layouts

### 5. Multi-Restaurant Support
- Mỗi chi nhánh có layouts riêng
- Sync layouts giữa các chi nhánh

## Files Liên Quan

### Admin Pages
- `v1/src/app/(pages)/admin/tables/layout/page.tsx` - Trang quản lý layouts

### Components
- `v1/src/components/reservations/TableSelectionModal.tsx` - Modal chọn bàn (load active layout)
- `v1/src/components/admin/tables/TableLayoutEditor.tsx` - Editor để tạo/sửa layout

### Utils
- `v1/src/lib/utils/defaultLayout.ts` - Logic tạo default layout

### Types
- Interface `TableLayout` với field `isActive?: boolean`

## Summary

Hệ thống Active Layout cho phép:
- ✅ Tạo nhiều layouts khác nhau
- ✅ Chọn một layout làm chính
- ✅ Chuyển đổi layout dễ dàng
- ✅ UI rõ ràng với badge và colors
- ✅ Khách hàng luôn thấy layout mới nhất
- ✅ Linh hoạt cho nhiều use cases

Admin có toàn quyền kiểm soát layout nào được hiển thị cho khách hàng!
