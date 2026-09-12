import { asc, count, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { complaints, type NewComplaint } from "@/db/schema";

export const complaintFields = [
  "sourceSheet",
  "project",
  "receivedDate",
  "month",
  "customer",
  "bookingCode",
  "privilege",
  "usageDate",
  "provider",
  "complaintContent",
  "cskhExplanation",
  "responsibleEmployee",
  "resolution",
  "compensation",
  "damage",
  "errorType",
  "improvementProposal",
  "managementOpinion",
  "teamLeaderOpinion",
] as const;

export type ComplaintInput = Pick<NewComplaint, (typeof complaintFields)[number]>;

export function toComplaintInput(value: unknown): ComplaintInput | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const receivedDate = String(body.receivedDate ?? "").trim();
  if (!receivedDate) return null;
  return {
    sourceSheet: String(body.sourceSheet ?? "manual").trim() || "manual",
    project: String(body.project ?? "Không xác định").trim() || "Không xác định",
    receivedDate,
    month: receivedDate.slice(0, 7),
    customer: String(body.customer ?? "").trim(),
    bookingCode: String(body.bookingCode ?? "").trim(),
    privilege: String(body.privilege ?? "").trim(),
    usageDate: String(body.usageDate ?? "").trim(),
    provider: String(body.provider ?? "").trim(),
    complaintContent: String(body.complaintContent ?? "").trim(),
    cskhExplanation: String(body.cskhExplanation ?? "").trim(),
    responsibleEmployee: String(body.responsibleEmployee ?? "").trim(),
    resolution: String(body.resolution ?? "").trim(),
    compensation: String(body.compensation ?? "").trim(),
    damage: String(body.damage ?? "").trim(),
    errorType: String(body.errorType ?? "").trim(),
    improvementProposal: String(body.improvementProposal ?? "").trim(),
    managementOpinion: String(body.managementOpinion ?? "").trim(),
    teamLeaderOpinion: String(body.teamLeaderOpinion ?? "").trim(),
  };
}

const unnamedPrivilege = sql<string>`coalesce(nullif(trim(${complaints.privilege}), ''), 'Không xác định')`;

export async function complaintSummary(params: { from?: string; to?: string; project?: string; privilege?: string } = {}) {
  const db = getDb();
  const conditions = [];
  if (params.from) conditions.push(gte(complaints.receivedDate, params.from));
  if (params.to) conditions.push(lte(complaints.receivedDate, params.to));
  if (params.project) conditions.push(eq(complaints.project, params.project));
  if (params.privilege) conditions.push(eq(complaints.privilege, params.privilege));
  const where = conditions.length ? sql.join(conditions, sql` and `) : undefined;
  const [total] = await db.select({ value: count() }).from(complaints).where(where);
  const byMonth = await db.select({ month: complaints.month, total: count() }).from(complaints).where(where).groupBy(complaints.month).orderBy(asc(complaints.month));
  const byProject = await db.select({ project: complaints.project, total: count() }).from(complaints).where(where).groupBy(complaints.project).orderBy(desc(count()));
  const byPrivilege = await db
    .select({ privilege: unnamedPrivilege.as("privilege"), total: count() })
    .from(complaints)
    .where(where)
    .groupBy(unnamedPrivilege)
    .orderBy(desc(count()));
  return {
    total: Number(total?.value ?? 0),
    byMonth: byMonth.map((row) => ({ month: row.month, total: Number(row.total) })),
    byProject: byProject.map((row) => ({ project: row.project, total: Number(row.total) })),
    byPrivilege: byPrivilege.map((row) => ({ privilege: row.privilege, total: Number(row.total) })),
  };
}

export async function listComplaints(params: { page: number; pageSize: number; search?: string; month?: string; project?: string; privilege?: string; provider?: string; bookingCode?: string; receivedFrom?: string; receivedTo?: string }) {
  const db = getDb();
  const conditions = [];
  if (params.search) {
    const value = `%${params.search}%`;
    conditions.push(or(ilike(complaints.project, value), ilike(complaints.receivedDate, value), ilike(complaints.customer, value), ilike(complaints.bookingCode, value), ilike(complaints.privilege, value), ilike(complaints.usageDate, value), ilike(complaints.provider, value), ilike(complaints.complaintContent, value), ilike(complaints.cskhExplanation, value), ilike(complaints.responsibleEmployee, value), ilike(complaints.resolution, value), ilike(complaints.compensation, value), ilike(complaints.damage, value), ilike(complaints.errorType, value), ilike(complaints.improvementProposal, value)));
  }
  if (params.month) conditions.push(eq(complaints.month, params.month));
  if (params.project) conditions.push(eq(complaints.project, params.project));
  if (params.privilege) conditions.push(eq(complaints.privilege, params.privilege));
  if (params.provider) conditions.push(eq(complaints.provider, params.provider));
  if (params.bookingCode) conditions.push(eq(complaints.bookingCode, params.bookingCode));
  if (params.receivedFrom) conditions.push(gte(complaints.receivedDate, params.receivedFrom));
  if (params.receivedTo) conditions.push(lte(complaints.receivedDate, params.receivedTo));
  const where = conditions.length ? sql.join(conditions, sql` and `) : undefined;
  const offset = (params.page - 1) * params.pageSize;
  const [rows, total] = await Promise.all([
    db.select().from(complaints).where(where).orderBy(desc(complaints.receivedDate), desc(complaints.id)).limit(params.pageSize).offset(offset),
    db.select({ value: count() }).from(complaints).where(where),
  ]);
  return { rows, total: Number(total[0]?.value ?? 0), page: params.page, pageSize: params.pageSize };
}

export async function exportComplaints(search?: string) {
  const db = getDb();
  const value = search?.trim() ? `%${search.trim()}%` : null;
  const where = value
    ? or(ilike(complaints.project, value), ilike(complaints.receivedDate, value), ilike(complaints.customer, value), ilike(complaints.bookingCode, value), ilike(complaints.privilege, value), ilike(complaints.usageDate, value), ilike(complaints.provider, value), ilike(complaints.complaintContent, value), ilike(complaints.cskhExplanation, value), ilike(complaints.responsibleEmployee, value), ilike(complaints.resolution, value), ilike(complaints.compensation, value), ilike(complaints.damage, value), ilike(complaints.errorType, value), ilike(complaints.improvementProposal, value))
    : undefined;
  return db.select().from(complaints).where(where).orderBy(desc(complaints.receivedDate), desc(complaints.id));
}

export async function getComplaint(id: number) {
  const [row] = await getDb().select().from(complaints).where(eq(complaints.id, id)).limit(1);
  return row ?? null;
}

export async function createComplaint(input: ComplaintInput) {
  const [row] = await getDb().insert(complaints).values(input).returning();
  return row;
}

export async function updateComplaint(id: number, input: ComplaintInput) {
  const current = await getComplaint(id);
  if (!current) return null;
  const managementOpinion = input.managementOpinion ?? "";
  const teamLeaderOpinion = input.teamLeaderOpinion ?? "";
  const opinionChanged = current.managementOpinion !== managementOpinion || current.teamLeaderOpinion !== teamLeaderOpinion;
  const hasOpinion = Boolean(managementOpinion.trim() || teamLeaderOpinion.trim());
  const [row] = await getDb().update(complaints).set({ ...input, managementResolved: opinionChanged && hasOpinion ? false : current.managementResolved, updatedAt: new Date() }).where(eq(complaints.id, id)).returning();
  return row ?? null;
}

export async function deleteComplaint(id: number) {
  const [row] = await getDb().delete(complaints).where(eq(complaints.id, id)).returning({ id: complaints.id });
  return row ?? null;
}

export async function listManagementNotifications() {
  return getDb()
    .select({
      id: complaints.id,
      project: complaints.project,
      receivedDate: complaints.receivedDate,
      bookingCode: complaints.bookingCode,
      customer: complaints.customer,
      managementOpinion: complaints.managementOpinion,
      teamLeaderOpinion: complaints.teamLeaderOpinion,
      complaintContent: complaints.complaintContent,
      updatedAt: complaints.updatedAt,
    })
    .from(complaints)
    .where(sql`(trim(${complaints.managementOpinion}) <> '' or trim(${complaints.teamLeaderOpinion}) <> '') and ${complaints.managementResolved} = false`)
    .orderBy(desc(complaints.updatedAt), desc(complaints.id));
}

export async function resolveManagementNotification(id: number) {
  const [row] = await getDb().update(complaints).set({ managementResolved: true, updatedAt: new Date() }).where(eq(complaints.id, id)).returning({ id: complaints.id });
  return row ?? null;
}
