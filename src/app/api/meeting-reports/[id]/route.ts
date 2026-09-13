import { NextRequest, NextResponse } from "next/server";
import { deleteMeetingReport, toMeetingReportInput, updateMeetingReport } from "@/lib/meeting-reports";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id); const input = toMeetingReportInput(await request.json().catch(() => null));
  if (!Number.isInteger(id) || id < 1 || !input) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  const row = await updateMeetingReport(id, input); return row ? NextResponse.json(row) : NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 });
}
export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = Number((await context.params).id); if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const row = await deleteMeetingReport(id); return row ? NextResponse.json(row) : NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 });
}