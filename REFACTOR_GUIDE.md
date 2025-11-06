# 📁 Cấu trúc Code Sau Refactor - Hướng dẫn sử dụng

## 🎯 Tổng quan

Code đã được tái cấu trúc theo nguyên tắc **Clean Architecture** và **Modular Design**, giúp:
- ✅ Dễ bảo trì và mở rộng
- ✅ Type safety với TypeScript
- ✅ Tách biệt concerns
- ✅ Tái sử dụng code hiệu quả
- ✅ Error handling nhất quán

## 📂 Cấu trúc thư mục mới

```
src/
├── lib/
│   ├── api/
│   │   ├── callApi.ts          # Shared API utilities
│   │   ├── analyticsApi.ts     # Analytics API functions  
│   │   ├── orderApi.ts         # Order API functions
│   │   └── index.ts            # Export tất cả API
│   ├── utils/
│   │   └── fetchWithFallback.ts # Utility xử lý fallback data
│   └── api.ts                  # Legacy API (backwards compatibility)
├── components/
│   ├── admin/
│   │   └── analytics/
│   │       ├── OrderAnalyticsDashboard.tsx # Main dashboard
│   │       ├── OrderSummary.tsx           # Summary cards
│   │       ├── StatusDistributionChart.tsx # Status chart
│   │       ├── DailyOrdersChart.tsx       # Daily trends
│   │       └── AnalyticsExample.tsx       # Usage example
│   └── ui/
│       ├── LoadingSpinner.tsx  # Loading states
│       └── ErrorState.tsx      # Error states
└── Types/
    └── index.ts               # Updated với ChartDataPoint interface
```

## 🔧 API Functions - Cách sử dụng mới

### 1. Import API Functions

```typescript
// ✅ Cách mới - Import từ modules riêng biệt
import { getOrderAnalytics, getRevenueStats } from '@/src/lib/api/analyticsApi';
import { getOrders, updateOrderStatus } from '@/src/lib/api/orderApi';

// ✅ Hoặc import tất cả từ index
import { getOrderAnalytics, getOrders } from '@/src/lib/api';

// ⚠️ Cách cũ vẫn hoạt động (backwards compatibility)
import { getOrderAnalytics } from '@/src/lib/api';
```

### 2. Analytics API

```typescript
import { getOrderAnalytics, getRevenueStats, getTopSellingItems } from '@/src/lib/api/analyticsApi';

// Lấy order analytics với type safety
const analytics = await getOrderAnalytics('30d');
// ✅ analytics.dailyOrders là ChartDataPoint[] (đã fix type conflict)

// Revenue stats với fallback handling
const revenueStats = await getRevenueStats('7d', startDate, endDate);

// Top selling items  
const topItems = await getTopSellingItems('30d', 10);
```

### 3. Order API  

```typescript
import { getOrders, updateOrderStatus, exportOrdersToCSV } from '@/src/lib/api/orderApi';

// Lấy orders với pagination
const orders = await getOrdersPaginate(1, 10, searchTerm, status);

// Update order status
await updateOrderStatus(orderId, 'completed');

// Export CSV
await exportOrdersToCSV({ status: 'completed' });
```

## 🧩 Components - Sử dụng Modular Design

### 1. OrderAnalyticsDashboard

```tsx
import OrderAnalyticsDashboard from '@/src/components/admin/analytics/OrderAnalyticsDashboard';

// ✅ Sử dụng component chính
<OrderAnalyticsDashboard period="30d" className="my-4" />
```

### 2. Sử dụng components riêng biệt

```tsx
import OrderSummary from '@/src/components/admin/analytics/OrderSummary';
import StatusDistributionChart from '@/src/components/admin/analytics/StatusDistributionChart';
import DailyOrdersChart from '@/src/components/admin/analytics/DailyOrdersChart';

// ✅ Sử dụng từng component độc lập
<OrderSummary 
  totalOrders={100}
  pendingOrders={20}
  completedOrders={70}
  cancelledOrders={10}
/>

<StatusDistributionChart statusDistribution={distribution} />

<DailyOrdersChart dailyOrders={chartData} />
```

## 🛡️ Type Safety Improvements

### 1. ChartDataPoint Interface

```typescript
// ✅ Đã thêm interface mới
interface ChartDataPoint {
  date: string;
  count: number;
}

// ✅ OrderAnalytics.dailyOrders giờ dùng ChartDataPoint[]
interface OrderAnalytics {
  // ...
  dailyOrders: ChartDataPoint[]; // Thay vì { date: string; count: number }[]
}
```

### 2. Fallback Data Handling

```typescript
import { fetchWithFallback, getDefaultOrderAnalytics } from '@/src/lib/utils/fetchWithFallback';

// ✅ API call với fallback an toàn
const analytics = await fetchWithFallback(
  () => getOrderAnalytics('30d'),
  getDefaultOrderAnalytics(),
  'Failed to fetch order analytics'
);
```

## 🚀 Error Handling Improvements

### 1. Centralized Error Handling

```typescript
// ✅ API calls tự động handle errors và fallbacks
const analytics = await getOrderAnalytics('30d');
// Sẽ trả về valid OrderAnalytics hoặc fallback data, không bao giờ null/undefined
```

### 2. Component Error States

```tsx
// ✅ Components tự handle loading và error states
<OrderAnalyticsDashboard period="30d" />
// Sẽ hiển thị LoadingSpinner khi loading, ErrorState khi có lỗi
```

## 📊 Usage Examples

### 1. Trang Analytics hoàn chỉnh

```tsx
'use client';

import React, { useState } from 'react';
import OrderAnalyticsDashboard from '@/src/components/admin/analytics/OrderAnalyticsDashboard';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Order Analytics</h1>
      
      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="7d">7 Days</option>
        <option value="30d">30 Days</option>
        <option value="90d">90 Days</option>
      </select>

      <OrderAnalyticsDashboard period={period} />
    </div>
  );
}
```

### 2. Custom Analytics Dashboard

```tsx
import React, { useEffect, useState } from 'react';
import { getOrderAnalytics } from '@/src/lib/api/analyticsApi';
import { OrderAnalytics } from '@/src/Types';
import OrderSummary from '@/src/components/admin/analytics/OrderSummary';
import DailyOrdersChart from '@/src/components/admin/analytics/DailyOrdersChart';

export default function CustomDashboard() {
  const [data, setData] = useState<OrderAnalytics | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const analytics = await getOrderAnalytics('7d');
      setData(analytics);
    };
    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <OrderSummary {...data} />
      <DailyOrdersChart dailyOrders={data.dailyOrders} />
    </div>
  );
}
```

## 🔄 Migration Guide

### Từ code cũ sang code mới:

```typescript
// ❌ Cũ - Type conflict và error handling kém
const getOrderAnalytics = async (period: string) => {
  const response = await api.get(`/analytics/orders/stats?period=${period}`);
  return response.data; // dailyOrders type không consistent
};

// ✅ Mới - Type safe và error handling tốt
import { getOrderAnalytics } from '@/src/lib/api/analyticsApi';
const analytics = await getOrderAnalytics(period); // Luôn trả về OrderAnalytics hợp lệ
```

## 📝 Best Practices

1. **Always use typed API functions**:
   ```typescript
   // ✅ Tốt
   import { getOrderAnalytics } from '@/src/lib/api/analyticsApi';
   
   // ❌ Tránh
   import axios from 'axios';
   const response = await axios.get('/analytics/...');
   ```

2. **Use modular components**:
   ```tsx
   // ✅ Tốt - Tái sử dụng được
   <OrderSummary {...orderStats} />
   
   // ❌ Tránh - Component quá lớn
   <MassiveAnalyticsDashboard />
   ```

3. **Leverage error boundaries**:
   ```tsx
   // ✅ Tốt
   <ErrorBoundary>
     <OrderAnalyticsDashboard />
   </ErrorBoundary>
   ```

## 🔍 Debugging Tips

1. **Check console warnings** cho API fallbacks
2. **Use TypeScript strict mode** để catch type errors  
3. **Test với empty/error data** để verify fallback logic
4. **Inspect network tab** để debug API calls

---

✨ **Code giờ đây clean, maintainable và type-safe!** ✨
