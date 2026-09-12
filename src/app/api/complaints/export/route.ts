import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { exportComplaints } from "@/lib/complaints";

export const runtime = "nodejs";

function authorized(request: NextRequest): boolean {
  const expected = process.env.CRM_API_KEY?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const origin = request.headers.get("origin");
  if (origin && origin === request.nextUrl.origin) return true;
  const referer = request.headers.get("referer");
  if (referer && referer.startsWith(`${request.nextUrl.origin}/`)) return true;
  return request.headers.get("x-api-key") === expected || request.headers.get("authorization") === `Bearer ${expected}`;
}

const headers: Record<string, string> = {
  sourceSheet: "Nguồn sheet", project: "Dự án", receivedDate: "Ngày tiếp nhận", month: "Tháng", customer: "Thông tin khách hàng",
  bookingCode: "Mã booking", privilege: "Loại đặc quyền", usageDate: "Lịch sử dụng", provider: "Nhà cung cấp", complaintContent: "Nội dung khiếu nại",
  cskhExplanation: "CSKH giải trình diễn biến", responsibleEmployee: "Nhân viên phụ trách / kết quả vi phạm / đã lập biên bản?", resolution: "Kết quả xử lý", compensation: "Quà tặng / đền bù", damage: "Thiệt hại", errorType: "Phân loại lỗi", improvementProposal: "Đề xuất cải tiến", managementOpinion: "Ý kiến quản lý", teamLeaderOpinion: "Ý kiến Team Leader",
};

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await exportComplaints(request.nextUrl.searchParams.get("search") || undefined);
  const data = rows.map((row) => Object.fromEntries(Object.entries(headers).map(([key, label]) => [label, row[key as keyof typeof row] ?? ""])));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), "Khiếu nại");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": `attachment; filename="linkcare-complaints-${new Date().toISOString().slice(0, 10)}.xlsx"` } });
}