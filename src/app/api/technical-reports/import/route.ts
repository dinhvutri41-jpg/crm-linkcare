import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createTechnicalReport, toTechnicalReportInput } from "@/lib/technical-reports";

export const runtime = "nodejs";

const aliases: Record<string, string> = {
  "STT": "sequence", "Dự án": "project", "Mô tả lỗi": "errorDescription", "Hệ thống bị lỗi": "affectedSystem",
  "Thời điểm báo IT": "reportTime", "Agent báo lỗi": "agentReported", "Thời điểm IT tiếp nhận lỗi": "itReceivedTime",
  "Thời điểm IT hoàn thành": "itCompletedTime", "Người xử lý": "handler", "Kết quả IT xử lý": "itResult",
  "CSKH test kết quả": "customerServiceTest", "Có complain/escalation không?": "complaintEscalation", "Mức độ ảnh hưởng - Đề xuất ý kiến": "complaintEscalation",
  "Tổng thời gian xử lý": "totalProcessingTime", "Trạng thái": "status",
};

function normalizeHeader(value: unknown) {
  return String(value ?? "").replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file is required" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File must be smaller than 10MB" }, { status: 413 });
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];
  if (rows.length < 2) return NextResponse.json({ error: "No technical report records were found" }, { status: 422 });
  const headers = (rows[0] || []).map((header) => aliases[normalizeHeader(header)] || normalizeHeader(header));
  const records = rows.slice(1).map((row) => {
    const value = Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]));
    return toTechnicalReportInput(value);
  }).filter((record): record is NonNullable<typeof record> => Boolean(record && (record.project || record.errorDescription)));
  if (!records.length) return NextResponse.json({ error: "No technical report records were found" }, { status: 422 });
  for (const record of records) await createTechnicalReport(record);
  return NextResponse.json({ imported: records.length, file: file.name });
}
