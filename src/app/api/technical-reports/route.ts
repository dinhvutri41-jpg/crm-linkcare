import { NextRequest, NextResponse } from "next/server";
import { createTechnicalReport, listTechnicalReports, toTechnicalReportInput } from "@/lib/technical-reports";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  return NextResponse.json(await listTechnicalReports(Number(params.get("page") || 1), Number(params.get("pageSize") || 15), { search: params.get("search") || "", project: params.get("project") || "", status: params.get("status") || "", reportFrom: params.get("reportFrom") || "", reportTo: params.get("reportTo") || "" }));
}

export async function POST(request: NextRequest) {
  const input = toTechnicalReportInput(await request.json().catch(() => null));
  if (!input?.project && !input?.errorDescription) return NextResponse.json({ error: "Dự án hoặc mô tả lỗi là bắt buộc" }, { status: 400 });
  return NextResponse.json(await createTechnicalReport(input), { status: 201 });
}