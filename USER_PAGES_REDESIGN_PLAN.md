# User Pages Complete Redesign Plan

## 🎯 Goal
Tạo lại UI hoàn toàn mới cho `/user/home` và `/user/profile` với thiết kế:
- Minimalist & Clean
- Professional
- Easy to read
- No flashy colors
- White/Gray theme only

---

## 📋 `/user/home` - New Design

### Current Issues:
- Quá nhiều màu vàng
- Animated blobs lấp lánh
- Quá nhiều gradient
- Cards quá màu mè

### New Design:

```
┌─────────────────────────────────────────────────────────┐
│  Simple Header (White bg)                               │
│  Welcome back, [Name]                                   │
│  [View Profile] [Settings]                              │
└─────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│  Quick Stats     │  Quick Stats     │  Quick Stats     │
│  Orders: 5       │  Points: 1200    │  Member: Gold    │
└──────────────────┴──────────────────┴──────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Recent Orders                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Order #123 | $50 | Completed | View Details    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Popular Dishes (Simple Grid)                           │
│  ┌────────┐ ┌────────┐ ┌────────┐                      │
│  │ Image  │ │ Image  │ │ Image  │                      │
│  │ Name   │ │ Name   │ │ Name   │                      │
│  │ $10    │ │ $15    │ │ $20    │                      │
│  └────────┘ └────────┘ └────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### Key Changes:
1. **Remove**: 
   - Yellow gradient hero
   - Animated blobs
   - All emojis
   - Hover scale effects
   - Complex gradients

2. **Add**:
   - Simple white header
   - Clean stat cards
   - Minimal order list
   - Simple product grid

3. **Colors**:
   - Background: white, gray-50
   - Text: gray-900, gray-600
   - Borders: gray-200
   - Accent: gray-900 (buttons)

---

## 📋 `/user/profile` - Already Updated

✅ Đã cập nhật với:
- White/gray theme
- No gradients
- No animations
- Clean layout
- Simple forms

---

## 🔧 Implementation Steps

### Step 1: Update `/user/home`
- [ ] Remove yellow gradient hero
- [ ] Create simple white header
- [ ] Redesign stats cards (white bg, simple)
- [ ] Simplify loyalty card
- [ ] Clean up order history
- [ ] Redesign popular dishes grid
- [ ] Remove all emojis
- [ ] Add Lucide icons where needed

### Step 2: Test & Refine
- [ ] Check readability
- [ ] Test on mobile
- [ ] Verify all interactions work
- [ ] Ensure consistent spacing

### Step 3: Documentation
- [ ] Update design guide
- [ ] Document new patterns
- [ ] Create reusable components

---

## 📝 Code Patterns

### Header (New)
```tsx
<div className="bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 py-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {name}</h1>
        <p className="text-gray-600 mt-1">Manage your orders and account</p>
      </div>
      <div className="flex gap-3">
        <Link href="/user/profile" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Profile
        </Link>
      </div>
    </div>
  </div>
</div>
```

### Stats Card (New)
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-6">
  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
  <p className="text-3xl font-bold text-gray-900">5</p>
</div>
```

### Order Item (New)
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
  <div className="flex items-center justify-between">
    <div>
      <p className="font-semibold text-gray-900">Order #123</p>
      <p className="text-sm text-gray-600">2 items • $50.00</p>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm text-green-600 font-medium">Completed</span>
      <button className="text-sm text-gray-600 hover:text-gray-900">View</button>
    </div>
  </div>
</div>
```

### Product Card (New)
```tsx
<div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
  <div className="aspect-square bg-gray-100">
    <img src={image} alt={name} className="w-full h-full object-cover" />
  </div>
  <div className="p-4">
    <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
    <p className="text-lg font-bold text-gray-900">${price}</p>
  </div>
</div>
```

---

## ✨ Expected Result

After redesign:
- **Clean**: No visual clutter
- **Fast**: No heavy animations
- **Professional**: Business-like appearance
- **Readable**: Clear information hierarchy
- **Consistent**: Same design language throughout
- **Accessible**: Good contrast, clear labels

---

**Priority**: High
**Estimated Time**: 1-2 hours
**Status**: Ready to implement
