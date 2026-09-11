import { asc, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { complaints } from "@/db/schema";

export async function complaintSummary() {
  const db = getDb();
  const [total] = await db.select({ value: count() }).from(complaints);
  const byMonth = await db.select({ month: complaints.month, total: count() }).from(complaints).groupBy(complaints.month).orderBy(asc(complaints.month));
  const byProject = await db.select({ project: complaints.project, total: count() }).from(complaints).groupBy(complaints.project).orderBy(desc(count())).limit(10);
  return { total: Number(total?.value ?? 0), byMonth: byMonth.map((row) => ({ month: row.month, total: Number(row.total) })), byProject: byProject.map((row) => ({ project: row.project, total: Number(row.total) })) };
}

export async function listComplaints(params: { page: number; pageSize: number; search?: string; month?: string; project?: string; provider?: string }) {
  const db = getDb();
  const conditions = [];
  if (params.search) {
    const value = `%${params.search}%`;
    conditions.push(or(ilike(complaints.project, value), ilike(complaints.receivedDate, value), ilike(complaints.customer, value), ilike(complaints.bookingCode, value), ilike(complaints.privilege, value), ilike(complaints.usageDate, value), ilike(complaints.provider, value)));
  }
  if (params.month) conditions.push(eq(complaints.month, params.month));
  if (params.project) conditions.push(eq(complaints.project, params.project));
  if (params.provider) conditions.push(eq(complaints.provider, params.provider));
  const where = conditions.length ? sql.join(conditions, sql` and `) : undefined;
  const offset = (params.page - 1) * params.pageSize;
  const [rows, total] = await Promise.all([
    db.select().from(complaints).where(where).orderBy(desc(complaints.receivedDate), desc(complaints.id)).limit(params.pageSize).offset(offset),
    db.select({ value: count() }).from(complaints).where(where),
  ]);
  return { rows, total: Number(total[0]?.value ?? 0), page: params.page, pageSize: params.pageSize };
}
