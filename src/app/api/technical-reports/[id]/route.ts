import { NextRequest, NextResponse } from "next/server";
import { deleteTechnicalReport, updateTechnicalReport, toTechnicalReportInput } from "@/lib/technical-reports";

async function reportId(context: { params: Promise<{ id: string }> }) {
  return Number((await context.params).id);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = await reportId(context);
  const input = toTechnicalReportInput(await request.json().catch(() => null));
  if (!Number.isInteger(id) || id < 1 || !input) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  const row = await updateTechnicalReport(id, input);
  return row ? NextResponse.json(row) : NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 });
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const id = await reportId(context);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid report id" }, { status: 400 });
  const row = await deleteTechnicalReport(id);
  return row ? NextResponse.json(row) : NextResponse.json({ error: "Không tìm thấy báo cáo" }, { status: 404 });
}