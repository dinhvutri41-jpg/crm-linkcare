import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/db";
import { meetingReports } from "@/db/schema";

export type MeetingReportInput = Omit<typeof meetingReports.$inferInsert, "id" | "createdAt" | "updatedAt">;

export function toMeetingReportInput(value: unknown): MeetingReportInput | null {
  const body = (value || {}) as Record<string, unknown>;
  const team = String(body.team ?? "").trim();
  const reportContent = String(body.reportContent ?? "").trim();
  if (!team || !reportContent) return null;
  return { team, reportContent, complaints: String(body.complaints ?? "").trim(), proposal: String(body.proposal ?? "").trim(), afterMeetingAction: String(body.afterMeetingAction ?? "").trim() };
}

export async function listMeetingReports(page = 1, pageSize = 15, search = "") {
  const value = search.trim();
  const filter = value ? or(ilike(meetingReports.team, `%${value}%`), ilike(meetingReports.reportContent, `%${value}%`), ilike(meetingReports.complaints, `%${value}%`), ilike(meetingReports.proposal, `%${value}%`), ilike(meetingReports.afterMeetingAction, `%${value}%`)) : undefined;
  const offset = (Math.max(1, page) - 1) * pageSize;
  const [rows, total] = await Promise.all([
    getDb().select().from(meetingReports).where(filter).orderBy(desc(meetingReports.updatedAt), desc(meetingReports.id)).limit(pageSize).offset(offset),
    getDb().select({ value: count() }).from(meetingReports).where(filter),
  ]);
  return { rows, total: Number(total[0]?.value ?? 0), page, pageSize };
}

export async function createMeetingReport(input: MeetingReportInput) { const [row] = await getDb().insert(meetingReports).values(input).returning(); return row; }
export async function updateMeetingReport(id: number, input: MeetingReportInput) { const [row] = await getDb().update(meetingReports).set({ ...input, updatedAt: new Date() }).where(eq(meetingReports.id, id)).returning(); return row ?? null; }
export async function deleteMeetingReport(id: number) { const [row] = await getDb().delete(meetingReports).where(eq(meetingReports.id, id)).returning({ id: meetingReports.id }); return row ?? null; }