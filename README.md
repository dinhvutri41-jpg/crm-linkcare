# LinkCare CRM

CRM riêng cho dữ liệu khiếu nại và vận hành LinkCare. Project dùng Next.js, PostgreSQL/Neon, Drizzle ORM và Recharts, deploy được trên Vercel.

## Chạy local

```bash
npm install
cp .env.example .env.local
# điền DATABASE_URL và CRM_API_KEY
npm run db:push
npm run dev
```

Mở `http://localhost:3000`.

## Import

Dashboard nhận `.csv`, `.xlsx`, `.xls`. Parser tự nhận diện các cột tiếng Việt như:

- Tên Dự án
- Ngày tiếp nhận khiếu nại / phàn nàn
- Thông tin khách hàng
- Mã booking
- Loại Đặc quyền
- Lịch sử dụng
- Nhà cung cấp

## API cho Lounge Finder

Set `CRM_API_KEY` trên cả hai Vercel project. API:

```bash
curl -H "x-api-key: $CRM_API_KEY" "https://your-crm.vercel.app/api/complaints?page=1&pageSize=20&month=2026-08"
curl -H "x-api-key: $CRM_API_KEY" "https://your-crm.vercel.app/api/summary"
curl -X POST -H "x-api-key: $CRM_API_KEY" -F file=@complaints.xlsx https://your-crm.vercel.app/api/import
curl -X POST -H "x-api-key: $CRM_API_KEY" -H "content-type: application/json" -d '{"url":"https://docs.google.com/spreadsheets/d/ID/edit?gid=1984496612"}' https://your-crm.vercel.app/api/import-url
```

Response `/api/complaints` có `rows`, `total`, `page`, `pageSize`. API giới hạn `pageSize` tối đa 100 và dùng query parameterized qua Drizzle.

## Vercel

Import folder này như một project riêng, thêm:

```text
CRM_DATABASE_URL=your-neon-or-postgres-url
CRM_API_KEY=long-random-api-key
```

Build command mặc định `next build`. Chạy `npm run db:push` một lần với database mới trước deploy, hoặc dùng Drizzle migration trong CI.
