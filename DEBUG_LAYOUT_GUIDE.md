# 🔍 Debug Layout Guide

## Vấn Đề
User không thấy layout chính mà admin đã chọn khi đặt bàn.

## Cách Debug

### 1. Mở Console (F12)

### 2. Chạy Debug Commands

```javascript
// Xem tất cả layouts trong localStorage
debugLayouts()

// Output sẽ hiển thị:
// - Số lượng layouts
// - Tên, isActive status của mỗi layout
// - Layout nào đang active
```

### 3. Kiểm Tra Active Layout

**Kết quả mong đợi:**
```
✅ Active layout found: {
  name: "Layout 1",
  tablesCount: 8,
  tables: ["T1", "T2", "T3", ...]
}
```

**Nếu thấy:**
```
⚠️ No active layout found!
```

**Giải pháp:**
```javascript
// Set layout đầu tiên làm active
const layouts = JSON.parse(localStorage.getItem('table-layouts'))
setActiveLayout(layouts[0]._id)
```

### 4. Test Flow

#### A. Admin Side (Trang /admin/tables/layout)
1. Tạo hoặc chọn một layout
2. Bấm "Đặt làm layout chính"
3. Thấy badge "LAYOUT CHÍNH" màu vàng
4. Mở console, chạy `debugLayouts()`
5. Xác nhận layout có `isActive: true`

#### B. User Side (Trang /reservation)
1. Điền form đặt bàn
2. Bấm "Select Table"
3. Modal mở → Xem console logs:
   ```
   🔵 Modal opened, loading tables...
   🔍 Current layouts in localStorage:
   📊 Layouts in localStorage: {...}
   ✅ Active layout found: {...}
   ```
4. Kiểm tra header modal có hiển thị:
   - Layout name
   - Badge "ACTIVE" màu vàng
5. Bấm nút reload (icon RotateCw) để force reload layout

### 5. Common Issues

#### Issue 1: Layout không sync giữa admin và user
**Nguyên nhân:** localStorage chỉ lưu trên browser hiện tại

**Giải pháp:**
- Admin và user phải dùng cùng browser/device
- Hoặc export/import layouts:
```javascript
// Admin: Export
exportLayouts() // Download file JSON

// User: Import
const json = '...' // Paste JSON content
importLayouts(json)
```

#### Issue 2: Tất cả layouts đều không active
**Nguyên nhân:** Data migration hoặc bug

**Giải pháp:**
```javascript
// Fix script
const layouts = JSON.parse(localStorage.getItem('table-layouts'))
layouts[0].isActive = true
layouts.slice(1).forEach(l => l.isActive = false)
localStorage.setItem('table-layouts', JSON.stringify(layouts))
debugLayouts() // Verify
```

#### Issue 3: Modal hiển thị layout cũ
**Nguyên nhân:** Cache hoặc không reload

**Giải pháp:**
1. Bấm nút reload trong modal (icon RotateCw)
2. Hoặc đóng và mở lại modal
3. Hoặc hard refresh (Ctrl+Shift+R)

### 6. Debug Console Commands

```javascript
// 1. Xem tất cả layouts
debugLayouts()

// 2. Set layout làm active (thay YOUR_LAYOUT_ID)
setActiveLayout('YOUR_LAYOUT_ID')

// 3. Clear tất cả layouts (cẩn thận!)
clearLayouts()

// 4. Export layouts ra file
exportLayouts()

// 5. Import layouts từ JSON
importLayouts('{"layouts": [...]}')
```

### 7. Verify Active Layout

**Trong Admin Page:**
```
Layout Card có:
- Border vàng (border-yellow-400)
- Ring effect (ring-2 ring-yellow-200)
- Badge "⭐ LAYOUT CHÍNH" màu vàng
```

**Trong User Modal:**
```
Header có:
- "Layout: [Tên Layout]"
- Badge "ACTIVE" màu vàng
- Grid hiển thị đúng bàn từ layout đó
```

### 8. Test Checklist

- [ ] Admin tạo layout mới
- [ ] Admin set layout làm active
- [ ] Badge "LAYOUT CHÍNH" hiển thị
- [ ] Console: `debugLayouts()` shows `isActive: true`
- [ ] User mở modal chọn bàn
- [ ] Modal header hiển thị layout name + "ACTIVE" badge
- [ ] Grid hiển thị đúng bàn từ layout active
- [ ] Bấm reload button → Layout vẫn đúng

### 9. Expected Console Output

**Khi mở modal:**
```
🔵 Modal opened, loading tables...
🔍 Current layouts in localStorage:
📊 Layouts in localStorage: {
  count: 2,
  layouts: [
    {
      index: 0,
      name: "Layout 1",
      isActive: true,  ← Đây là layout active
      tablesCount: 8,
      gridSize: "12x10"
    },
    {
      index: 1,
      name: "Layout 2",
      isActive: false,
      tablesCount: 4,
      gridSize: "8x10"
    }
  ]
}
✅ Active layout found: {
  name: "Layout 1",
  tablesCount: 8,
  tables: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"]
}
🔵 Tables loaded, loading active layout... 8 tables
🔵 Active layout loaded: {
  name: "Layout 1",
  isActive: true,
  tablesCount: 8,
  gridSize: "12x10"
}
```

### 10. Quick Fix Script

Nếu layout không sync, chạy script này trong console:

```javascript
// Quick fix: Ensure first layout is active
(function() {
  const saved = localStorage.getItem('table-layouts');
  if (!saved) {
    console.log('No layouts found');
    return;
  }
  
  const layouts = JSON.parse(saved);
  if (layouts.length === 0) {
    console.log('No layouts in array');
    return;
  }
  
  // Set first layout as active
  layouts[0].isActive = true;
  layouts.slice(1).forEach(l => l.isActive = false);
  
  localStorage.setItem('table-layouts', JSON.stringify(layouts));
  console.log('✅ Fixed! First layout is now active:', layouts[0].name);
  debugLayouts();
})();
```

## Summary

Với các debug tools này, bạn có thể:
1. ✅ Xem layouts trong localStorage
2. ✅ Kiểm tra layout nào đang active
3. ✅ Set layout làm active manually
4. ✅ Export/Import layouts
5. ✅ Force reload layout trong modal
6. ✅ Verify layout sync giữa admin và user

Nếu vẫn có vấn đề, check console logs để xem error messages!
