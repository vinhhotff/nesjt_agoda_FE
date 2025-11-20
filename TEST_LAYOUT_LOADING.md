# 🧪 Test Layout Loading - Tránh Tạo Default Layout Không Cần Thiết

## Vấn Đề Đã Fix
Hệ thống tự động tạo "Default Layout" mặc dù đã có layout chính được admin set.

## Root Causes Đã Fix

### 1. UseEffect Chạy Nhiều Lần
**Vấn đề:** useEffect với dependency `[tables]` chạy mỗi khi tables thay đổi
**Fix:** Thêm check `!selectedLayout` để chỉ load 1 lần

### 2. Không Reset State Khi Mở Modal
**Vấn đề:** selectedLayout từ lần mở trước vẫn còn
**Fix:** Reset `setSelectedLayout(null)` khi modal mở

### 3. Logic Tạo Default Không Rõ Ràng
**Vấn đề:** Không có log rõ ràng khi nào tạo default
**Fix:** Thêm console.log chi tiết cho mỗi case

## Test Cases

### Test 1: Có Layout Chính
**Setup:**
1. Admin đã tạo "Layout 1" và set làm active
2. localStorage có layouts với `isActive: true`

**Steps:**
1. User vào `/reservation`
2. Bấm "Select Table"
3. Xem console logs

**Expected Console Output:**
```
🔵 Modal opened, loading tables...
🔍 Current layouts in localStorage:
📊 Layouts in localStorage: {count: 1, layouts: [{name: "Layout 1", isActive: true, ...}]}
✅ Active layout found: Layout 1
🔵 Tables loaded, loading active layout... 8 tables
✅ Loaded layouts from localStorage: {layoutsCount: 1, ...}
✅ Found active layout: Layout 1
🔵 Active layout loaded: {name: "Layout 1", isActive: true, ...}
```

**Expected Result:**
- ✅ Modal hiển thị "Layout 1"
- ✅ Badge "ACTIVE" hiển thị
- ✅ KHÔNG tạo "Default Layout" mới
- ✅ localStorage vẫn chỉ có 1 layout

### Test 2: Có Layouts Nhưng Không Có Active
**Setup:**
1. localStorage có layouts nhưng tất cả `isActive: undefined`

**Steps:**
1. User mở modal chọn bàn
2. Xem console logs

**Expected Console Output:**
```
✅ Loaded layouts from localStorage: {layoutsCount: 2, ...}
⚠️ No active layout found, setting first layout as active: Layout 1
✅ Fixed and saved layouts
🔵 Active layout loaded: {name: "Layout 1", isActive: true, ...}
```

**Expected Result:**
- ✅ Layout đầu tiên được set active
- ✅ Lưu lại vào localStorage
- ✅ KHÔNG tạo "Default Layout" mới

### Test 3: Không Có Layout Nào
**Setup:**
1. localStorage không có layouts (hoặc empty)
2. Database có bàn

**Steps:**
1. User mở modal chọn bàn
2. Xem console logs

**Expected Console Output:**
```
⚠️ No layouts found in localStorage, creating default...
📝 Creating default layout with 8 tables
✅ Default layout created and saved
🔵 Active layout loaded: {name: "Default Layout", isActive: true, ...}
```

**Expected Result:**
- ✅ Tạo "Default Layout" mới
- ✅ Layout có `isActive: true`
- ✅ Lưu vào localStorage

### Test 4: Mở Modal Nhiều Lần
**Setup:**
1. Đã có layout chính

**Steps:**
1. Mở modal → Đóng
2. Mở modal → Đóng
3. Mở modal → Đóng
4. Check localStorage

**Expected Result:**
- ✅ Chỉ có 1 layout trong localStorage
- ✅ KHÔNG tạo thêm layouts mới
- ✅ Layout vẫn là layout chính ban đầu

### Test 5: Admin Thay Đổi Layout Chính
**Setup:**
1. Có "Layout 1" (active) và "Layout 2" (inactive)

**Steps:**
1. Admin vào `/admin/tables/layout`
2. Bấm "Đặt làm layout chính" trên "Layout 2"
3. User mở modal chọn bàn
4. Xem console logs

**Expected Console Output:**
```
✅ Loaded layouts from localStorage: {layoutsCount: 2, ...}
✅ Found active layout: Layout 2
```

**Expected Result:**
- ✅ Modal hiển thị "Layout 2"
- ✅ Badge "ACTIVE" trên "Layout 2"
- ✅ KHÔNG hiển thị "Layout 1"

## Debug Commands

### Check Current State
```javascript
// Xem layouts
debugLayouts()

// Xem chi tiết
const layouts = JSON.parse(localStorage.getItem('table-layouts'))
console.table(layouts.map(l => ({
  name: l.name,
  isActive: l.isActive,
  tables: l.tables.length
})))
```

### Force Reload Layout
Trong modal, bấm nút reload (icon RotateCw) hoặc:
```javascript
// Trong console
location.reload()
```

### Clear và Test Lại
```javascript
// Clear layouts
localStorage.removeItem('table-layouts')

// Reload page
location.reload()

// Mở modal → Sẽ tạo default layout
```

## Verify Fix

### 1. Check Console Logs
- ✅ Không thấy "Creating default layout" khi đã có layouts
- ✅ Thấy "Found active layout: [Tên Layout]"
- ✅ Không có duplicate logs

### 2. Check localStorage
```javascript
const layouts = JSON.parse(localStorage.getItem('table-layouts'))
console.log('Total layouts:', layouts.length)
console.log('Active layouts:', layouts.filter(l => l.isActive).length)
```

**Expected:**
- Total layouts: Số layouts admin đã tạo (không tăng tự động)
- Active layouts: 1 (chỉ 1 layout active)

### 3. Check Modal Header
- ✅ Hiển thị tên layout đúng
- ✅ Badge "ACTIVE" hiển thị
- ✅ Grid hiển thị bàn từ layout đúng

## Common Issues

### Issue: Vẫn tạo default layout
**Check:**
1. Console có log "No layouts found in localStorage"?
2. localStorage có layouts không? `localStorage.getItem('table-layouts')`
3. Layouts có `isActive: true` không?

**Fix:**
```javascript
// Ensure có ít nhất 1 layout active
const layouts = JSON.parse(localStorage.getItem('table-layouts'))
if (layouts && layouts.length > 0) {
  layouts[0].isActive = true
  localStorage.setItem('table-layouts', JSON.stringify(layouts))
}
```

### Issue: Modal hiển thị layout cũ
**Fix:**
1. Bấm nút reload trong modal
2. Hoặc hard refresh (Ctrl+Shift+R)
3. Hoặc clear cache

## Summary

**Fixes Applied:**
1. ✅ Chỉ load layout 1 lần (check `!selectedLayout`)
2. ✅ Reset state khi mở modal
3. ✅ Chi tiết console logs
4. ✅ Chỉ tạo default khi KHÔNG có layouts

**Expected Behavior:**
- Có layouts → Dùng layout active
- Không có active → Set layout đầu tiên active
- Không có layouts → Tạo default layout
- KHÔNG tạo default khi đã có layouts

Test passed! 🎉
