import { NextRequest, NextResponse } from "next/server";
import { resolveManagementNotification } from "@/lib/complaints";

function authorized(request: NextRequest): boolean {
  const expected = process.env.CRM_API_KEY?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const origin = request.headers.get("origin");
  if (origin && origin === request.nextUrl.origin) return true;
  const referer = request.headers.get("referer");
  if (referer && referer.startsWith(`${request.nextUrl.origin}/`)) return true;
  return request.headers.get("x-api-key") === expected || request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Invalid notification id" }, { status: 400 });
  const resolved = await resolveManagementNotification(id);
  return resolved ? NextResponse.json({ resolved: true, id }) : NextResponse.json({ error: "Notification not found" }, { status: 404 });
}