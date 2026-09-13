import { NextRequest, NextResponse } from "next/server";
import { getTechnicalReportStats } from "@/lib/technical-reports";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  return NextResponse.json(await getTechnicalReportStats({ project: params.get("project") || "", reportFrom: params.get("reportFrom") || "", reportTo: params.get("reportTo") || "" }));
}