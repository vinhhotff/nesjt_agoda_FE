# Giải pháp xử lý lỗi CORS khi deploy trên Vercel

## Vấn đề

Khi deploy frontend lên Vercel (`https://nesjt-agoda-fe.vercel.app`), bạn gặp lỗi CORS khi gọi API đến backend trên Render (`https://be-vang.onrender.com`).

**Lỗi:**
```
Access to XMLHttpRequest at 'https://be-vang.onrender.com/api/v1/auth/refresh' 
from origin 'https://nesjt-agoda-fe.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Nguyên nhân

CORS (Cross-Origin Resource Sharing) là một cơ chế bảo mật của trình duyệt. Khi frontend và backend chạy trên các domain khác nhau:
- Frontend: `https://nesjt-agoda-fe.vercel.app`
- Backend: `https://be-vang.onrender.com`

Trình duyệt sẽ chặn các requests cross-origin trừ khi backend cho phép thông qua CORS headers.

## Giải pháp đã áp dụng

### 1. Sử dụng Next.js Rewrites để Proxy Requests

Thay vì gọi trực tiếp đến backend từ client-side, chúng ta sử dụng Next.js rewrites để proxy requests qua cùng domain, tránh vấn đề CORS.

**File: `next.config.ts`**
- Cấu hình rewrites để proxy tất cả requests từ `/api/*` đến backend
- Requests sẽ đi qua Next.js server, không bị chặn bởi CORS

### 2. Cập nhật API Configuration

**Files: `src/lib/api.ts` và `src/lib/api/callApi.ts`**
- Tự động detect khi đang chạy trên Vercel (production)
- Sử dụng relative path `/api` thay vì absolute URL khi ở production
- Giữ nguyên absolute URL cho development (localhost)

## Cách hoạt động

1. **Development (localhost):**
   - API calls sử dụng: `http://localhost:8083/api/v1/*`
   - Gọi trực tiếp đến backend local

2. **Production (Vercel):**
   - API calls sử dụng: `/api/*` (relative path)
   - Next.js rewrites sẽ proxy đến: `https://be-vang.onrender.com/api/v1/*`
   - Requests đi qua cùng domain, không có vấn đề CORS

## Cấu hình Environment Variables

Đảm bảo bạn đã set environment variable trên Vercel:

1. Vào Vercel Dashboard → Project Settings → Environment Variables
2. Thêm biến:
   - `NEXT_PUBLIC_API_URL`: `https://be-vang.onrender.com/api/v1` (optional, có default)

## Lưu ý

### Về `withCredentials: true`

Code hiện tại sử dụng `withCredentials: true` để gửi cookies. Khi sử dụng rewrites:
- Cookies sẽ được forward từ client → Next.js server → backend
- Đảm bảo backend vẫn nhận được cookies đúng cách

### Nếu vẫn gặp vấn đề

Nếu sau khi deploy vẫn gặp lỗi, có thể do:

1. **Backend chưa được cấu hình CORS đúng cách** (nếu cần gọi trực tiếp)
   - Cần thêm `https://nesjt-agoda-fe.vercel.app` vào allowed origins
   - Cần set `Access-Control-Allow-Credentials: true` nếu dùng cookies

2. **Environment variable chưa được set trên Vercel**
   - Kiểm tra lại trong Vercel Dashboard

3. **Next.js rewrites không hoạt động**
   - Kiểm tra logs trên Vercel để xem có lỗi gì không
   - Đảm bảo `next.config.ts` được commit và deploy

## Testing

Sau khi deploy:

1. Mở DevTools → Network tab
2. Kiểm tra các API requests:
   - URL phải là: `https://nesjt-agoda-fe.vercel.app/api/...` (không phải `be-vang.onrender.com`)
   - Status code phải là 200 (không phải CORS error)

## Tài liệu tham khảo

- [Next.js Rewrites Documentation](https://nextjs.org/docs/api-reference/next.config.js/rewrites)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

