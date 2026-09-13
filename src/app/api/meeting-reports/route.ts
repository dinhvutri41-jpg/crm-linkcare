import { NextRequest, NextResponse } from "next/server";
import { createMeetingReport, listMeetingReports, toMeetingReportInput } from "@/lib/meeting-reports";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  return NextResponse.json(await listMeetingReports(Number(params.get("page") || 1), Number(params.get("pageSize") || 15), params.get("search") || ""));
}
export async function POST(request: NextRequest) {
  const input = toMeetingReportInput(await request.json().catch(() => null));
  if (!input) return NextResponse.json({ error: "Team và nội dung báo cáo là bắt buộc" }, { status: 400 });
  return NextResponse.json(await createMeetingReport(input), { status: 201 });
}