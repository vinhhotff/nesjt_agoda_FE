# UI Components Guide - User Interface

## 🎨 Tổng Quan

Hệ thống UI components hiện đại và mượt mà cho phần user-facing của dự án.

## 📦 Components Đã Tạo

### 1. Button

Component button với nhiều variants và animations.

```tsx
import { Button } from '@/src/components/ui';
import { ShoppingCart } from 'lucide-react';

// Basic usage
<Button>Click Me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icon
<Button icon={<ShoppingCart className="w-5 h-5" />}>
  Add to Cart
</Button>

// Loading state
<Button loading={true}>Processing...</Button>

// Full width
<Button fullWidth>Full Width Button</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `icon`: ReactNode
- `fullWidth`: boolean

---

### 2. Card

Component card đơn giản với hover effects.

```tsx
import { Card } from '@/src/components/ui';

// Basic card
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Hoverable card
<Card hoverable>
  <p>This card has hover effect</p>
</Card>

// Custom padding
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hoverable`: boolean
- `className`: string

---

### 3. Input

Component input với label, error và icon support.

```tsx
import { Input } from '@/src/components/ui';
import { Mail, Lock } from 'lucide-react';

// Basic input
<Input 
  label="Email"
  placeholder="Enter your email"
  required
/>

// With icon
<Input 
  label="Email"
  icon={<Mail className="w-5 h-5" />}
  placeholder="your@email.com"
/>

// With error
<Input 
  label="Password"
  type="password"
  error="Password is required"
/>

// With helper text
<Input 
  label="Username"
  helperText="Choose a unique username"
/>
```

**Props:**
- `label`: string
- `error`: string
- `icon`: ReactNode
- `helperText`: string
- All standard input props

---

### 4. Textarea

Component textarea với label và error support.

```tsx
import { Textarea } from '@/src/components/ui';

<Textarea 
  label="Message"
  placeholder="Enter your message"
  rows={5}
  required
/>

// With error
<Textarea 
  label="Comments"
  error="This field is required"
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- All standard textarea props

---

### 5. Select

Component select dropdown với custom styling.

```tsx
import { Select } from '@/src/components/ui';

<Select 
  label="Country"
  options={[
    { value: 'vn', label: 'Vietnam' },
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
  required
/>

// With error
<Select 
  label="Category"
  options={categories}
  error="Please select a category"
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `options`: Array<{ value: string; label: string }>
- All standard select props

---

### 6. Badge

Component badge cho labels và tags.

```tsx
import { Badge } from '@/src/components/ui';

// Variants
<Badge variant="primary">New</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Sold Out</Badge>
<Badge variant="info">Info</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
- `size`: 'sm' | 'md' | 'lg'

---

### 7. Modal

Component modal với animations và backdrop.

```tsx
import { Modal } from '@/src/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        size="md"
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: boolean

**Features:**
- ESC key to close
- Click outside to close
- Smooth animations
- Body scroll lock

---

### 8. Avatar

Component avatar cho user profiles.

```tsx
import { Avatar } from '@/src/components/ui';

// With image
<Avatar src="/avatar.jpg" alt="User" />

// With name (shows initials)
<Avatar name="John Doe" />

// Sizes
<Avatar name="John Doe" size="sm" />
<Avatar name="John Doe" size="md" />
<Avatar name="John Doe" size="lg" />
<Avatar name="John Doe" size="xl" />
```

**Props:**
- `src`: string
- `alt`: string
- `name`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'

---

### 9. Alert

Component alert cho notifications và messages.

```tsx
import { Alert } from '@/src/components/ui';

// Variants
<Alert variant="info">This is an info message</Alert>
<Alert variant="success">Operation successful!</Alert>
<Alert variant="warning">Please be careful</Alert>
<Alert variant="error">Something went wrong</Alert>

// With title
<Alert variant="success" title="Success!">
  Your changes have been saved
</Alert>

// Dismissible
<Alert 
  variant="info" 
  onClose={() => console.log('Closed')}
>
  This alert can be dismissed
</Alert>
```

**Props:**
- `variant`: 'info' | 'success' | 'warning' | 'error'
- `title`: string
- `onClose`: () => void

---

### 10. Skeleton

Component skeleton cho loading states.

```tsx
import { Skeleton, SkeletonCard, SkeletonText } from '@/src/components/ui';

// Basic skeleton
<Skeleton width={200} height={20} />

// Variants
<Skeleton variant="text" />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" width="100%" height={200} />

// Animations
<Skeleton animation="pulse" />
<Skeleton animation="wave" />
<Skeleton animation="none" />

// Preset skeletons
<SkeletonCard />
<SkeletonText lines={3} />
```

**Props:**
- `variant`: 'text' | 'circular' | 'rectangular'
- `width`: string | number
- `height`: string | number
- `animation`: 'pulse' | 'wave' | 'none'

---

### 11. Tooltip

Component tooltip cho hints và help text.

```tsx
import { Tooltip } from '@/src/components/ui';

<Tooltip content="This is a tooltip" position="top">
  <button>Hover me</button>
</Tooltip>

// Positions
<Tooltip content="Top" position="top">...</Tooltip>
<Tooltip content="Bottom" position="bottom">...</Tooltip>
<Tooltip content="Left" position="left">...</Tooltip>
<Tooltip content="Right" position="right">...</Tooltip>
```

**Props:**
- `content`: string
- `position`: 'top' | 'bottom' | 'left' | 'right'

---

## 🎨 Design Tokens

### Colors
```css
Primary: from-orange-500 to-red-500
Secondary: from-gray-700 to-gray-800
Success: from-green-500 to-emerald-600
Warning: from-yellow-400 to-orange-500
Danger: from-red-500 to-red-600
Info: from-blue-500 to-blue-600
```

### Spacing
```css
sm: 0.5rem (2px), 1rem (4px)
md: 1.5rem (6px), 2rem (8px)
lg: 3rem (12px), 4rem (16px)
```

### Border Radius
```css
sm: rounded-lg (8px)
md: rounded-xl (12px)
lg: rounded-2xl (16px)
xl: rounded-3xl (24px)
```

### Shadows
```css
sm: shadow-sm
md: shadow-lg
lg: shadow-xl
xl: shadow-2xl
```

## 🚀 Usage Examples

### Form Example
```tsx
import { Input, Textarea, Select, Button } from '@/src/components/ui';

function ContactForm() {
  return (
    <form className="space-y-6">
      <Input 
        label="Name"
        placeholder="Your name"
        required
      />
      
      <Input 
        label="Email"
        type="email"
        placeholder="your@email.com"
        required
      />
      
      <Select 
        label="Subject"
        options={[
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Support' },
        ]}
        required
      />
      
      <Textarea 
        label="Message"
        placeholder="Your message"
        rows={5}
        required
      />
      
      <Button type="submit" fullWidth>
        Send Message
      </Button>
    </form>
  );
}
```

### Card Grid Example
```tsx
import { Card, Badge, Button } from '@/src/components/ui';

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(product => (
        <Card key={product.id} hoverable>
          <img src={product.image} alt={product.name} />
          <div className="flex items-center justify-between mt-4">
            <h3 className="font-bold">{product.name}</h3>
            <Badge variant="success">{product.price}</Badge>
          </div>
          <p className="text-gray-600 mt-2">{product.description}</p>
          <Button fullWidth className="mt-4">
            Add to Cart
          </Button>
        </Card>
      ))}
    </div>
  );
}
```

## 📝 Best Practices

1. **Consistency**: Luôn sử dụng components thay vì tạo styles riêng
2. **Accessibility**: Components đã có aria-labels và keyboard support
3. **Responsive**: Tất cả components đều responsive
4. **Performance**: Sử dụng lazy loading cho Modal
5. **Type Safety**: Tất cả components đều có TypeScript types

---

**Updated**: 2025-11-19  
**Version**: 1.0
