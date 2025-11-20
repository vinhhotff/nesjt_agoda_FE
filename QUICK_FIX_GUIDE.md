# Quick Fix Guide - User Pages

## 🎯 Mục tiêu
Chuyển `/user/home` và `/user/profile` sang thiết kế minimalist (white/gray)

## ✅ Đã xong
- `/user/profile` - Đã chuyển sang white/gray theme

## 🔄 Cần làm: `/user/home`

### Tìm và thay thế (Find & Replace):

#### 1. Hero Section (Line ~123)
**Tìm:**
```tsx
<div className="relative overflow-hidden bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-500 rounded-3xl shadow-2xl p-8 md:p-12">
  <div className="absolute inset-0 opacity-20">
    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
    <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
  </div>
```

**Thay bằng:**
```tsx
<div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12">
```

#### 2. Loyalty Card (Line ~135)
**Tìm:**
```tsx
<div className="md:col-span-2 bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-500 rounded-3xl shadow-2xl p-8 text-white
```

**Thay bằng:**
```tsx
<div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-8
```

#### 3. All Buttons
**Tìm:** `bg-gradient-to-r from-yellow-500 to-yellow-600`
**Thay bằng:** `bg-gray-900`

**Tìm:** `hover:from-yellow-600 hover:to-yellow-700`
**Thay bằng:** `hover:bg-gray-800`

#### 4. Background
**Tìm:** `bg-gradient-to-br from-slate-50 to-slate-100`
**Thay bằng:** `bg-gray-50`

#### 5. Remove animations
**Tìm:** `animate-pulse`
**Thay bằng:** (xóa)

**Tìm:** `hover:scale-105`
**Thay bằng:** (xóa)

#### 6. Text colors in yellow sections
**Tìm:** `text-white` (trong loyalty card)
**Thay bằng:** `text-gray-900`

**Tìm:** `text-white/90`
**Thay bằng:** `text-gray-600`

---

## 💡 Hoặc tôi có thể:

### Option A: Tôi làm từng phần nhỏ
- Redesign hero (5 phút)
- Redesign stats (5 phút)  
- Redesign loyalty card (5 phút)
- Redesign orders (5 phút)
- Redesign dishes (5 phút)

### Option B: Bạn tự làm theo guide
- Follow guide trên
- Find & replace từng phần
- Test sau mỗi thay đổi

### Option C: Tôi tạo file mới hoàn toàn
- Tạo file mới từ đầu
- Copy logic cũ
- UI hoàn toàn mới
- Mất nhiều token hơn

---

**Bạn muốn tôi làm theo option nào?**
