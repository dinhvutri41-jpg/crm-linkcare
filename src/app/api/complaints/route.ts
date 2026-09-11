import { NextRequest, NextResponse } from "next/server";
import { listComplaints } from "@/lib/complaints";

function authorized(request: NextRequest): boolean {
  const expected = process.env.CRM_API_KEY?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const origin = request.headers.get("origin");
  if (origin && origin === request.nextUrl.origin) return true;
  return request.headers.get("x-api-key") === expected || request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)));
  const result = await listComplaints({ page, pageSize, search: searchParams.get("search") || undefined, month: searchParams.get("month") || undefined, project: searchParams.get("project") || undefined, provider: searchParams.get("provider") || undefined });
  return NextResponse.json(result);
}
