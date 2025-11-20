# Color Theme Update - Yellow Theme

## 🎨 Màu Sắc Chính

Toàn bộ dự án đã được cập nhật để sử dụng **màu vàng (Yellow)** làm màu chủ đạo thay vì orange-red.

### Primary Colors
- **Main**: `yellow-500` (#eab308)
- **Light**: `yellow-400` (#facc15)
- **Dark**: `yellow-600` (#ca8a04)
- **Hover**: `yellow-600` to `yellow-700`

### Gradients
- **Primary**: `from-yellow-500 to-yellow-600`
- **Hover**: `from-yellow-600 to-yellow-700`
- **Light**: `from-yellow-400 to-yellow-500`

## ✅ Components Đã Cập Nhật

### 1. Header (`src/components/Header/Header.tsx`)
- ✅ Logo: Yellow gradient
- ✅ Active link: Yellow color
- ✅ Active underline: Yellow gradient
- ✅ Cart badge: Yellow gradient background
- ✅ User avatar: Yellow gradient background
- ✅ Dropdown hover: Yellow background (`hover:bg-yellow-50`)

### 2. Footer (`src/components/Footer/Footer.tsx`)
- ✅ Brand text: Yellow gradient
- ✅ Social icons hover: Yellow background
- ✅ Link hover: Yellow color
- ✅ Bottom gradient line: Yellow

### 3. UI Components

#### Button (`src/components/ui/button.tsx`)
- ✅ Primary variant: Yellow gradient
- ✅ Outline variant: Yellow border and text
- ✅ Hover states: Yellow

#### Badge (`src/components/ui/badge.tsx`)
- ✅ Primary variant: Yellow background and text

#### Avatar (`src/components/ui/Avatar.tsx`)
- ✅ Background: Yellow gradient

#### Input (`src/components/ui/Input.tsx`)
- ✅ Focus ring: Yellow (`focus:ring-yellow-500`)

#### Textarea (`src/components/ui/Textarea.tsx`)
- ✅ Focus ring: Yellow

#### Select (`src/components/ui/Select.tsx`)
- ✅ Focus ring: Yellow

### 4. Pages

#### Menu Page (`src/app/(homePage)/menu/page.tsx`)
- ✅ Hero section: Yellow gradient background
- ✅ Filter sidebar accent: Yellow gradient

#### Contact Page (`src/app/(homePage)/contact/page.tsx`)
- ✅ Hero title accent: Yellow gradient
- ✅ Contact info icons: Yellow gradient
- ✅ Form focus: Yellow
- ✅ Submit button: Yellow gradient
- ✅ CTA button: Yellow gradient

## 🎯 Consistency Rules

### Hover States
- Links: `hover:text-yellow-500`
- Backgrounds: `hover:bg-yellow-50` (light) or `hover:bg-yellow-500` (solid)
- Buttons: `hover:from-yellow-600 hover:to-yellow-700`

### Focus States
- Inputs: `focus:ring-yellow-500`
- Buttons: `focus:ring-yellow-500`

### Active States
- Links: `text-yellow-500`
- Buttons: `bg-yellow-500`
- Tabs: Yellow underline

### Shadows
- Light: `shadow-yellow-500/30`
- Hover: `shadow-yellow-500/40`

## 📝 Usage Guidelines

### For New Components
Khi tạo component mới, sử dụng:

```tsx
// Primary button
className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"

// Text color
className="text-yellow-500"

// Background
className="bg-yellow-50" // light
className="bg-yellow-500" // solid

// Border
className="border-yellow-500"

// Focus ring
className="focus:ring-yellow-500"

// Shadow
className="shadow-lg shadow-yellow-500/30"
```

### Import Colors
Sử dụng constants từ `src/styles/colors.ts`:

```tsx
import colors from '@/src/styles/colors';

// Use in className
className={`bg-gradient-to-r ${colors.gradients.primary}`}
```

## 🔍 Verification Checklist

- [x] Header logo và navigation
- [x] Footer branding và links
- [x] Button components (all variants)
- [x] Form inputs (Input, Textarea, Select)
- [x] Badge components
- [x] Avatar components
- [x] Menu page hero và filters
- [x] Contact page hero và form
- [x] Menu Grid cards (price, add to cart button)
- [x] Category Filter (active state)
- [x] Tag Filter (ring color)
- [x] Old Button component
- [x] Design system CSS variables
- [x] Gradient text utility class
- [ ] Login page (cần cập nhật CSS modules)
- [ ] Register page (cần cập nhật CSS modules)
- [ ] Homepage hero section
- [ ] About page
- [ ] Reservation page

## 🚀 Next Steps

1. Cập nhật Login/Register pages để dùng màu vàng
2. Cập nhật Homepage hero section
3. Kiểm tra About và Reservation pages
4. Test trên tất cả breakpoints (mobile, tablet, desktop)
5. Đảm bảo contrast ratio đủ cho accessibility

## 📊 Color Palette Reference

```css
/* Yellow Scale */
yellow-50:  #fefce8
yellow-100: #fef9c3
yellow-200: #fef08a
yellow-300: #fde047
yellow-400: #facc15
yellow-500: #eab308 /* Primary */
yellow-600: #ca8a04
yellow-700: #a16207
yellow-800: #854d0e
yellow-900: #713f12
```

---

**Last Updated**: 2025-11-19  
**Status**: ✅ Core components completed, pages in progress
