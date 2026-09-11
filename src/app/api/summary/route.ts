import { NextRequest, NextResponse } from "next/server";
import { complaintSummary } from "@/lib/complaints";

function authorized(request: NextRequest): boolean {
  const expected = process.env.CRM_API_KEY?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const origin = request.headers.get("origin");
  if (origin && origin === request.nextUrl.origin) return true;
  return request.headers.get("x-api-key") === expected || request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await complaintSummary());
}
