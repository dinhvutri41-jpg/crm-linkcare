# Hướng dẫn sử dụng VIP BOOKING 24H

Tài liệu này hướng dẫn người dùng thao tác trên website VIP BOOKING 24H.

## 1. Đăng nhập

1. Mở website.
2. Nhập email và mật khẩu được cấp.
3. Bấm **Đăng nhập**.
4. Sau khi đăng nhập, website mở trang **Tổng quan**.

> Nếu không thao tác trong khoảng thời gian dài, hệ thống có thể tự đăng xuất. Hãy đăng nhập lại để tiếp tục.

## 2. Menu chính

Sidebar bên trái gồm:

- **Tổng quan**: xem nhanh tình hình vận hành.
- **Đội ngũ**: xem sơ đồ tổ chức và nhân sự VIP BOOKING 24H.
- **Báo cáo khiếu nại**: quản lý các case khiếu nại.
- **Báo cáo lỗi kĩ thuật**: quản lý lỗi hệ thống và lỗi kỹ thuật.
- **E-learning**: xem và quản lý thư viện đào tạo.
- **Báo cáo giao ban**: quản lý nội dung báo cáo sau các buổi giao ban.

Bạn có thể bấm logo VIP BOOKING 24H để quay về trang **Tổng quan**.

## 3. Trang Tổng quan

Trang Tổng quan có các khu vực:

### Khiếu nại đang xử lý

- Hiển thị số case có trạng thái `Chưa xử lý` hoặc `Đang xử lý`.
- Số được đếm animation khi trang tải.
- Bấm vào card để mở trang **Báo cáo khiếu nại**.

### Bài học nội bộ

- Hiển thị số khóa học hiện có.
- Số được lấy trực tiếp từ dữ liệu hệ thống và có animation counter.
- Bấm vào card để mở **E-learning**.

### Đội ngũ hoạt động

- Hiển thị tổng số nhân sự: `36`.
- Bấm vào card để mở **Sơ đồ tổ chức**.

### Dòng hoạt động

- Hiển thị tối đa 5 hoạt động gần nhất.
- Theo dõi thay đổi từ:
  - Báo cáo khiếu nại.
  - Báo cáo lỗi kĩ thuật.
  - E-learning.
- Hoạt động mới sẽ được đưa lên đầu danh sách.
- Màu nhận diện:
  - Khiếu nại: đỏ nhạt.
  - Lỗi kỹ thuật: xanh dương nhạt.
  - E-learning: xanh lá nhạt.

## 4. Báo cáo khiếu nại

Mở từ menu **Báo cáo khiếu nại**.

### Tạo case mới

1. Bấm **Tạo case mới**.
2. Nhập các thông tin khiếu nại.
3. Chọn dự án, đặc quyền và trạng thái nếu có.
4. Bấm **Lưu record**.
5. Hệ thống hiển thị toast xác nhận thành công hoặc lỗi.

Trong danh sách dự án có các lựa chọn như BIDV, VietcomBank, VietinBank, TechcomBank, UOB, TechcomLife và Elite.

### Sửa case

1. Tìm record cần sửa.
2. Bấm **Sửa**.
3. Cập nhật các trường thông tin.
4. Bấm **Lưu**.

### Xóa case

1. Bấm **Xóa** ở record cần xóa.
2. Xác nhận thao tác.
3. Record sẽ bị xóa khỏi database.

### Đổi trạng thái

Có thể đổi trực tiếp trạng thái trong dòng dữ liệu:

- `Chưa xử lý`
- `Đang xử lý`
- `Hoàn thành`

### Tìm kiếm và lọc

Có thể tìm kiếm toàn bộ dữ liệu và lọc theo ngày, dự án, đặc quyền hoặc trạng thái.

Danh sách sử dụng lazy loading: khi cuộn xuống gần cuối, hệ thống tự tải thêm dữ liệu và hiển thị spinner.

### Import và export

- **Import**: tải lên file `.csv`, `.xlsx` hoặc `.xls`.
- **Xuất Excel**: tải danh sách dữ liệu về máy dưới dạng Excel.
- Nên kiểm tra tên cột trong file trước khi import.

## 5. Báo cáo lỗi kĩ thuật

Mở từ menu **Báo cáo lỗi kĩ thuật**.

### Các thao tác chính

- **Tạo case mới**: tạo một báo cáo lỗi.
- **Sửa**: cập nhật nội dung báo cáo.
- **Xóa**: xóa báo cáo sau khi xác nhận.
- Dropdown trạng thái trong cột thao tác:
  - `Chưa xử lý`
  - `Đang xử lý`
  - `Hoàn thành`

### Bộ lọc

Trong card **Danh sách báo cáo lỗi** có các filter:

- Từ ngày.
- Đến ngày.
- Trạng thái.
- Dự án.
- Ô tìm kiếm nội dung.

Thay đổi filter sẽ tải lại từ 15 record đầu theo điều kiện mới.

### Các trường thời gian

Ba trường thời gian dùng datetime picker:

- Thời điểm báo IT.
- Thời điểm IT tiếp nhận lỗi.
- Thời điểm IT hoàn thành.

Định dạng lưu và hiển thị:

```text
hh:mm dd/mm/yyyy
```

Ví dụ: `14:25 20/05/2026`.

### Hệ thống bị lỗi

Chọn một giá trị trong dropdown:

- Izzi
- Loungkey
- BSGD, doanh nghiệp
- onepay
- Web Linkcare
- Omi
- Phòng chờ
- Email
- omicall
- Landing page
- Khác

Khi chọn **Khác**, một ô nhập bổ sung sẽ xuất hiện.

### Xem báo cáo

Bấm **Xem báo cáo** để mở popup thống kê:

- Case chưa xử lý: biểu đồ vòng tròn, số case hiển thị ở giữa.
- Báo cáo theo dự án: biểu đồ cột.
- Báo cáo theo hệ thống bị lỗi: biểu đồ cột.
- Filter trong popup theo ngày và dự án.
- Popup cũng hiển thị dự án và hệ thống có nhiều báo cáo nhất.

### Import và export

- **Import Excel**: thêm nhiều báo cáo từ `.csv`, `.xlsx` hoặc `.xls`.
- **Xuất Excel**: tải dữ liệu theo các filter hiện tại.
- Khi danh sách dài, hệ thống tự tải thêm 15 record khi cuộn đến cuối.

## 6. E-learning

Mở từ menu **E-learning**.

### Danh sách khóa học

- Mỗi dự án có một khóa học.
- Card các dự án có màu gradient riêng.
- Bấm vào card để mở nội dung khóa học.

### Tạo hoặc cập nhật khóa học

1. Mở `/learning/courses/new`.
2. Bấm **Tạo khóa học** để mở card form.
3. Chọn dự án.
4. Nhập danh sách chương trình đặc quyền và tình huống.
5. Nhập:
   - Câu hỏi/tình huống khách hàng.
   - Câu trả lời chuẩn.
   - Các bước Agent.
   - Khi nào báo Team Leader/Manager.
   - Ghi chú đào tạo.
   - Cấp độ câu hỏi.
6. Bấm **Lưu khóa học**.

Cấp độ câu hỏi gồm:

- `KH mới`
- `Cơ bản`
- `Nâng cao`

Khi bấm **Sửa**, form sẽ mở và cuộn mượt tới card cập nhật.

### Xem nội dung khóa học

Trong trang chi tiết khóa học:

1. Chọn **Chương trình đặc quyền**.
2. Hệ thống hiển thị các tình huống thuộc chương trình đó.
3. Có thể tìm kiếm câu hỏi hoặc câu trả lời.
4. Mỗi tình huống hiển thị các block màu:
   - Các bước Agent: xanh dương nhạt.
   - Khi nào báo Team Leader/Manager: đỏ nhạt.
   - Ghi chú đào tạo: xanh lá nhạt.

## 7. Đội ngũ

Mở từ menu **Đội ngũ** hoặc card **Đội ngũ hoạt động**.

Trang hiển thị:

- CEO và nhóm leadership.
- Các team VCB, TCB, UOB - TCL, BIDV, VTB, ELITE.
- Tên nhân sự và vị trí.
- Tổng số nhân sự duy nhất là `36`; nhân sự kiêm nhiệm chỉ tính một lần.
- Animation reveal khi cuộn tới các team.

## 8. Báo cáo giao ban

Mở từ item cuối sidebar **Báo cáo giao ban**.

### Tạo báo cáo

1. Bấm **Tạo báo cáo**.
2. Nhập Team/Dự án.
3. Nhập nội dung báo cáo.
4. Nhập khiếu nại phát sinh, đề xuất và nội dung cần thực hiện sau họp.
5. Bấm **Lưu báo cáo**.

### Sửa và xóa

- Bấm icon bút chì để sửa.
- Bấm icon thùng rác để xóa.
- Xác nhận trước khi xóa.
- Danh sách tải thêm 15 record khi cuộn gần cuối.

## 9. Toast thông báo

Sau các thao tác tạo, sửa, xóa hoặc import:

- Toast xanh: thao tác thành công.
- Toast đỏ: lỗi hoặc không thể thực hiện.
- Toast tự biến mất sau vài giây.

## 10. Hỗ trợ kỹ thuật

Nếu website không tải đúng:

1. Tải lại trang.
2. Kiểm tra tài khoản đăng nhập.
3. Kiểm tra kết nối mạng.
4. Báo quản trị viên kèm URL, thao tác vừa thực hiện và ảnh chụp lỗi.

### Lệnh dành cho quản trị viên

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Database/import được quản trị bằng các script trong `package.json`, không nên chạy `db:push` trên database có bảng legacy nếu Drizzle cảnh báo thao tác xóa dữ liệu.
