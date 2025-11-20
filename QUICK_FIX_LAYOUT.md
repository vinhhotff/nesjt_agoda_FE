# 🔧 Quick Fix: Layout isActive undefined

## Vấn Đề
Layout có `isActive: undefined` thay vì `true` hoặc `false`.

## Nguyên Nhân
- Layouts được tạo trước khi có field `isActive`
- Migration chưa chạy

## Giải Pháp Nhanh

### Option 1: Tự Động Fix (Recommended)
1. Vào trang `/admin/tables/layout`
2. Hệ thống sẽ tự động detect và fix layouts
3. Thấy toast: "🔧 Đã tự động sửa layouts cũ"
4. Reload trang để verify

### Option 2: Manual Fix (Console)
Mở console (F12) và chạy:

```javascript
// Quick fix script
(function() {
  const saved = localStorage.getItem('table-layouts');
  if (!saved) {
    console.log('❌ No layouts found');
    return;
  }
  
  const layouts = JSON.parse(saved);
  console.log('📊 Before fix:', layouts.map(l => ({ 
    name: l.name, 
    isActive: l.isActive 
  })));
  
  // Set first layout as active, others as inactive
  layouts.forEach((l, index) => {
    l.isActive = (index === 0);
  });
  
  localStorage.setItem('table-layouts', JSON.stringify(layouts));
  
  console.log('✅ After fix:', layouts.map(l => ({ 
    name: l.name, 
    isActive: l.isActive 
  })));
  
  alert('✅ Fixed! Please reload the page.');
})();
```

### Option 3: Clear và Tạo Lại
Nếu không cần giữ layouts cũ:

```javascript
// Clear all layouts
localStorage.removeItem('table-layouts');
alert('Cleared! Please create a new layout.');
```

## Verify Fix

### 1. Check Console
```javascript
debugLayouts()
```

**Expected output:**
```
✅ Active layout found: {
  name: "Default Layout",
  isActive: true,  ← Phải là true, không phải undefined
  tablesCount: 8
}
```

### 2. Check Admin Page
- Vào `/admin/tables/layout`
- Layout đầu tiên phải có:
  - Border vàng
  - Badge "⭐ LAYOUT CHÍNH"

### 3. Check User Modal
- Vào `/reservation`
- Bấm "Select Table"
- Header phải hiển thị:
  - Layout name
  - Badge "ACTIVE" màu vàng

## Prevent Future Issues

### Khi Tạo Layout Mới
Đảm bảo code luôn set `isActive`:

```typescript
const newLayout = {
  ...layout,
  _id: Date.now().toString(),
  isActive: layouts.length === 0  // true nếu là layout đầu tiên
};
```

### Khi Import Layouts
Luôn validate và fix:

```javascript
function importLayouts(jsonString) {
  const layouts = JSON.parse(jsonString);
  
  // Fix undefined isActive
  layouts.forEach((l, index) => {
    if (l.isActive === undefined) {
      l.isActive = (index === 0);
    }
  });
  
  localStorage.setItem('table-layouts', JSON.stringify(layouts));
}
```

## Test After Fix

1. ✅ Admin page shows "LAYOUT CHÍNH" badge
2. ✅ Console `debugLayouts()` shows `isActive: true`
3. ✅ User modal shows "ACTIVE" badge
4. ✅ User modal displays correct tables from active layout

## Summary

**Vấn đề:** `isActive: undefined`

**Fix:**
1. Auto-fix khi vào admin page
2. Hoặc chạy quick fix script trong console
3. Hoặc clear và tạo lại

**Verify:**
- `debugLayouts()` → `isActive: true`
- Admin page → Badge "LAYOUT CHÍNH"
- User modal → Badge "ACTIVE"

Done! 🎉
