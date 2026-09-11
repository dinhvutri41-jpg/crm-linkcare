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

function spreadsheetExportUrl(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.hostname !== "docs.google.com") return null;
    const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
    if (!match) return null;
    const gid = url.searchParams.get("gid");
    const suffix = gid ? `&gid=${encodeURIComponent(gid)}` : "";
    return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(match[1])}/export?format=xlsx${suffix}`;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { url?: string } | null;
  const exportUrl = body?.url ? spreadsheetExportUrl(body.url) : null;
  if (!exportUrl) return NextResponse.json({ error: "A valid public Google Sheets URL is required" }, { status: 400 });
  const response = await fetch(exportUrl, { cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: `Google Sheet returned ${response.status}` }, { status: 502 });
  const records = parseComplaintWorkbook(await response.arrayBuffer(), exportUrl);
  if (!records.length) return NextResponse.json({ error: "No complaint records were found" }, { status: 422 });
  await getDb().insert(complaints).values(records);
  return NextResponse.json({ imported: records.length });
}
