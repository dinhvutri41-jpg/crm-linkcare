import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { complaints } from "@/db/schema";
import { parseComplaintWorkbook } from "@/lib/complaints-import";

export const runtime = "nodejs";

function authorized(request: NextRequest): boolean {
  const expected = process.env.CRM_API_KEY?.trim();
  if (!expected) return process.env.NODE_ENV !== "production";
  const origin = request.headers.get("origin");
  if (origin && origin === request.nextUrl.origin) return true;
  return request.headers.get("x-api-key") === expected || request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file is required" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File must be smaller than 10MB" }, { status: 413 });
  const records = parseComplaintWorkbook(await file.arrayBuffer(), file.name);
  if (!records.length) return NextResponse.json({ error: "No complaint records were found" }, { status: 422 });
  await getDb().insert(complaints).values(records);
  return NextResponse.json({ imported: records.length, file: file.name });
}
