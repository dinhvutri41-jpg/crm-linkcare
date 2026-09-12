import { NextRequest, NextResponse } from "next/server";
import { createComplaint, listComplaints, toComplaintInput } from "@/lib/complaints";

function authorized(request: NextRequest): boolean {
  const expected = process.env.CRM_API_KEY?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const origin = request.headers.get("origin");
  if (origin && origin === request.nextUrl.origin) return true;
  const referer = request.headers.get("referer");
  if (referer && referer.startsWith(`${request.nextUrl.origin}/`)) return true;
  return request.headers.get("x-api-key") === expected || request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 20)));
  const receivedFrom = searchParams.get("receivedFrom") || undefined;
  const receivedTo = searchParams.get("receivedTo") || undefined;
  const project = searchParams.get("project") || undefined;
  const privilege = searchParams.get("privilege") || undefined;
  if (receivedFrom && receivedTo && receivedFrom > receivedTo) return NextResponse.json({ error: "Khoảng ngày tiếp nhận không hợp lệ" }, { status: 400 });
  const result = await listComplaints({ page, pageSize, search: searchParams.get("search") || undefined, month: searchParams.get("month") || undefined, project, privilege, provider: searchParams.get("provider") || undefined, bookingCode: searchParams.get("bookingCode") || undefined, receivedFrom, receivedTo });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = toComplaintInput(await request.json().catch(() => null));
    if (!input) return NextResponse.json({ error: "receivedDate is required" }, { status: 400 });
    return NextResponse.json(await createComplaint(input), { status: 201 });
  } catch (error) {
    console.error("POST /api/complaints failed", error);
    const detail = error instanceof Error ? error.message : "Unknown database error";
    return NextResponse.json({ error: process.env.NODE_ENV === "production" ? "Không thể lưu bản ghi vào database" : detail }, { status: 500 });
  }
}
