# Component Refactoring Guide

## Tổng quan
Dự án đã được refactor để chia nhỏ các component lớn thành các component nhỏ hơn, có thể tái sử dụng và dễ maintain hơn.

## Cấu trúc mới

### 1. UI Components (`src/components/ui/`)
Các component cơ bản có thể tái sử dụng:

- **LoadingSpinner** - Component loading với các size khác nhau
- **ErrorState** - Component hiển thị lỗi với retry option
- **Modal** - Modal wrapper component với các size configurable
- **FormField** - Wrapper cho form fields với label và error handling
- **Input** - Input component với variants và error states
- **RadioGroup** - Component radio button group

### 2. Layout Components (`src/components/layout/`)
Các component layout để organize trang:

- **PageContainer** - Container với max-width và padding
- **AdminLayout** - Layout dành cho admin pages với sidebar và header
- **FilterLayout** - Layout cho các trang có filter sidebar

### 3. Feature-specific Components

#### Menu Components (`src/components/menu/`)
- **ActiveFilters** - Hiển thị các filter đang active với option xóa từng filter
- **ResultsSummary** - Hiển thị tổng số kết quả
- **MenuPageSkeleton** - Loading skeleton cho menu page

#### Checkout Components (`src/components/checkout/`)
- **CustomerDetailsForm** - Form thông tin khách hàng
- **OrderTypeSelection** - Component chọn loại order (pickup/delivery)
- **VoucherSection** - Section voucher với order summary

### 4. Custom Hooks (`src/hooks/`)
Logic được extract thành hooks:

- **useMenuFilters** - Quản lý state và logic filter menu
- **useCheckoutForm** - Quản lý form checkout và voucher logic

## Lợi ích của việc refactoring

### 1. **Tái sử dụng (Reusability)**
- UI components có thể dùng ở nhiều nơi khác nhau
- Layout components tạo consistency across pages
- Form components giảm duplicate code

### 2. **Maintainability**
- Code được tổ chức rõ ràng theo feature và responsibility
- Dễ debug và fix bugs
- Dễ thêm features mới

### 3. **Testability**
- Mỗi component có scope nhỏ, dễ test
- Logic được tách riêng trong hooks, dễ unit test

### 4. **Developer Experience**
- Code dễ đọc và hiểu
- Props interface rõ ràng
- TypeScript support tốt hơn

## Cách sử dụng

### Import UI Components
```tsx
import { LoadingSpinner, ErrorState, Modal } from '@/src/components/ui';
```

### Import Layout Components  
```tsx
import { AdminLayout, PageContainer } from '@/src/components/layout';
```

### Sử dụng Custom Hooks
```tsx
import { useMenuFilters } from '@/src/hooks/useMenuFilters';
import { useCheckoutForm } from '@/src/hooks/useCheckoutForm';
```

## Ví dụ Usage

### Sử dụng LoadingSpinner
```tsx
<LoadingSpinner size="lg" text="Đang tải dữ liệu..." />
```

### Sử dụng ErrorState
```tsx
<ErrorState 
  title="Lỗi tải dữ liệu"
  message="Không thể tải menu. Vui lòng thử lại."
  onRetry={() => refetch()}
/>
```

### Sử dụng Modal
```tsx
<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  title="Xác nhận"
  size="md"
>
  <p>Nội dung modal</p>
</Modal>
```

## Các file đã được refactor

### Trước refactoring:
- `menu/page.tsx` (280+ dòng)
- `CheckoutModal.tsx` (200+ dòng) 
- Admin dashboard với layout duplicate

### Sau refactoring:
- Menu page: Chia thành 6+ components nhỏ
- CheckoutModal: Chia thành 4 components + 1 hook
- Admin pages: Sử dụng AdminLayout component
- Tạo được 15+ reusable components

## Best Practices được áp dụng

1. **Single Responsibility** - Mỗi component chỉ làm 1 việc
2. **Props Interface** - TypeScript interfaces rõ ràng
3. **Composition over Inheritance** - Dùng composition để build UI
4. **Custom Hooks** - Logic tách riêng khỏi UI
5. **Consistent Naming** - Naming convention clear và consistent
6. **Error Handling** - Proper error states và loading states

## Kết luận

Việc refactoring này giúp codebase:
- ✅ Dễ maintain hơn
- ✅ Tái sử dụng code tốt hơn  
- ✅ Ít duplicate code
- ✅ Chuẩn bị tốt cho scale up
- ✅ Developer experience tốt hơn

Có thể tiếp tục áp dụng pattern này cho các component khác trong dự án.
