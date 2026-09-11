import { NextRequest, NextResponse } from "next/server";
import { deleteComplaint, getComplaint, toComplaintInput, updateComplaint } from "@/lib/complaints";

function authorized(request: NextRequest): boolean {
  const expected = process.env.CRM_API_KEY?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const origin = request.headers.get("origin");
  if (origin && origin === request.nextUrl.origin) return true;
  return request.headers.get("x-api-key") === expected || request.headers.get("authorization") === `Bearer ${expected}`;
}

function complaintId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = complaintId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Invalid complaint id" }, { status: 400 });
  const row = await getComplaint(id);
  return row ? NextResponse.json(row) : NextResponse.json({ error: "Complaint not found" }, { status: 404 });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = complaintId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Invalid complaint id" }, { status: 400 });
  const current = await getComplaint(id);
  if (!current) return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  const body = await request.json().catch(() => null);
  const input = toComplaintInput({ ...current, ...(body && typeof body === "object" ? body : {}) });
  if (!input) return NextResponse.json({ error: "receivedDate is required" }, { status: 400 });
  const row = await updateComplaint(id, input);
  return NextResponse.json(row);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = complaintId((await context.params).id);
  if (!id) return NextResponse.json({ error: "Invalid complaint id" }, { status: 400 });
  const row = await deleteComplaint(id);
  return row ? NextResponse.json({ deleted: true, id }) : NextResponse.json({ error: "Complaint not found" }, { status: 404 });
}