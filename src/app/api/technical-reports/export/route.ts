import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { listTechnicalReports } from "@/lib/technical-reports";

export const runtime = "nodejs";

const headers = {
  project: "Dự án", errorDescription: "Mô tả lỗi", affectedSystem: "Hệ thống bị lỗi", reportTime: "Thời điểm báo IT (hh:mm dd/mm/yyyy)",
  agentReported: "Agent báo lỗi", itReceivedTime: "Thời điểm IT tiếp nhận lỗi (hh:mm dd/mm/yyyy)", itCompletedTime: "Thời điểm IT hoàn thành (hh:mm dd/mm/yyyy)",
  handler: "Người xử lý", itResult: "Kết quả IT xử lý", customerServiceTest: "CSKH test kết quả", complaintEscalation: "Mức độ ảnh hưởng - Đề xuất ý kiến", totalProcessingTime: "Tổng thời gian xử lý", status: "Trạng thái",
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const options = { search: params.get("search") || "", project: params.get("project") || "", status: params.get("status") || "", reportFrom: params.get("reportFrom") || "", reportTo: params.get("reportTo") || "" };
  const first = await listTechnicalReports(1, 100, options);
  const rows = [...first.rows];
  for (let page = 2; rows.length < first.total; page += 1) rows.push(...(await listTechnicalReports(page, 100, options)).rows);
  const data = rows.map((row) => Object.fromEntries(Object.entries(headers).map(([key, label]) => [label, row[key as keyof typeof row] ?? ""])));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), "Báo cáo lỗi kỹ thuật");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, { headers: { "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "content-disposition": `attachment; filename="technical-reports-${new Date().toISOString().slice(0, 10)}.xlsx"` } });
}
