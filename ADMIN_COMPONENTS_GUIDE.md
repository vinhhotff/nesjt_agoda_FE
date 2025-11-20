# Hướng Dẫn Sử Dụng Admin Components

## 🎨 Components Mới

### 1. AdminButton

Button component hiện đại với nhiều variants và animations.

```tsx
import { AdminButton } from '@/src/components/admin/common';
import { Plus } from 'lucide-react';

// Primary button
<AdminButton variant="primary" size="md">
  Save Changes
</AdminButton>

// With icon
<AdminButton variant="success" icon={<Plus className="w-4 h-4" />}>
  Add New
</AdminButton>

// Loading state
<AdminButton variant="primary" loading={isLoading}>
  Submitting...
</AdminButton>

// All variants
<AdminButton variant="primary">Primary</AdminButton>
<AdminButton variant="secondary">Secondary</AdminButton>
<AdminButton variant="success">Success</AdminButton>
<AdminButton variant="danger">Danger</AdminButton>
<AdminButton variant="warning">Warning</AdminButton>
<AdminButton variant="info">Info</AdminButton>

// Sizes
<AdminButton size="sm">Small</AdminButton>
<AdminButton size="md">Medium</AdminButton>
<AdminButton size="lg">Large</AdminButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `icon`: ReactNode
- `disabled`: boolean
- Tất cả props của HTMLButtonElement

### 2. AdminCard

Card component với glass morphism effect và animations.

```tsx
import { AdminCard } from '@/src/components/admin/common';
import { Settings } from 'lucide-react';

// Basic card
<AdminCard>
  <p>Card content here</p>
</AdminCard>

// With header
<AdminCard
  title="Settings"
  subtitle="Manage your preferences"
  icon={<Settings className="w-6 h-6 text-white" />}
>
  <p>Card content</p>
</AdminCard>

// With action button
<AdminCard
  title="Users"
  action={
    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
      Add User
    </button>
  }
>
  <p>User list here</p>
</AdminCard>

// With gradient overlay
<AdminCard gradient hoverable>
  <p>Beautiful card with gradient</p>
</AdminCard>
```

**Props:**
- `title`: string
- `subtitle`: string
- `icon`: ReactNode
- `action`: ReactNode
- `hoverable`: boolean (default: true)
- `gradient`: boolean (default: false)
- `className`: string

### 3. AdminPageHeader

Header component cho các trang admin với animations.

```tsx
import { AdminPageHeader } from '@/src/components/admin/common';
import { Users } from 'lucide-react';

<AdminPageHeader
  title="User Management"
  description="Manage all users in your system"
  icon={<Users className="w-6 h-6 text-white" />}
  action={
    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl">
      Add User
    </button>
  }
/>
```

## 🎯 Cách Sử Dụng Trong Trang Admin

### Example: Trang Users

```tsx
'use client';

import { AdminLayout } from '@/src/components/layout';
import { AdminPageHeader, AdminButton, AdminCard } from '@/src/components/admin/common';
import { Users, Plus } from 'lucide-react';

export default function UsersPage() {
  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto">
        <AdminPageHeader
          title="User Management"
          description="Manage all users and their permissions"
          icon={<Users className="w-6 h-6 text-white" />}
          action={
            <AdminButton 
              variant="primary" 
              icon={<Plus className="w-5 h-5" />}
              onClick={() => console.log('Add user')}
            >
              Add User
            </AdminButton>
          }
        />

        <AdminCard
          title="Active Users"
          subtitle="Currently active users in the system"
          gradient
        >
          {/* User list content */}
        </AdminCard>
      </div>
    </AdminLayout>
  );
}
```

## 🎨 Styling Guidelines

### Colors
- **Primary**: Blue gradient (from-blue-500 to-blue-600)
- **Success**: Green gradient (from-green-500 to-emerald-600)
- **Warning**: Yellow-Orange gradient (from-yellow-400 to-orange-500)
- **Danger**: Red gradient (from-red-500 to-red-600)

### Spacing
- **Small**: p-4, gap-2
- **Medium**: p-6, gap-4
- **Large**: p-8, gap-6

### Border Radius
- **Small**: rounded-lg (8px)
- **Medium**: rounded-xl (12px)
- **Large**: rounded-2xl (16px)
- **Extra Large**: rounded-3xl (24px)

### Shadows
- **Small**: shadow-sm
- **Medium**: shadow-lg
- **Large**: shadow-xl
- **Extra Large**: shadow-2xl

## 🚀 Best Practices

1. **Consistency**: Sử dụng các component này thay vì tạo button/card riêng
2. **Icons**: Luôn sử dụng Lucide React icons
3. **Animations**: Tránh overuse animations, chỉ dùng khi cần thiết
4. **Responsive**: Test trên mobile, tablet, desktop
5. **Accessibility**: Luôn thêm aria-labels và titles cho buttons

## 📱 Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

## 🎭 Animation Classes

```css
/* Hover effects */
hover:scale-105      /* Slight scale up */
hover:shadow-xl      /* Enhanced shadow */
hover:-translate-y-1 /* Lift up */

/* Transitions */
transition-all duration-300  /* Smooth transition */
transition-colors duration-200 /* Color transition */

/* Custom animations */
animate-pulse        /* Pulsing effect */
animate-shimmer      /* Shine effect */
animate-gradient-x   /* Gradient animation */
```

## 💡 Tips

1. **Glass Effect**: Sử dụng `bg-white/80 backdrop-blur-sm` cho modern look
2. **Gradients**: Combine với shadows để tạo depth
3. **Hover States**: Luôn có feedback rõ ràng khi hover
4. **Loading States**: Sử dụng `loading` prop của AdminButton
5. **Icons**: Match icon size với button size (sm: w-4, md: w-5, lg: w-6)

---

**Updated**: 2025-11-19  
**Version**: 1.0
