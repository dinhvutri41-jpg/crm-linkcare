import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { technicalReports } from "@/db/schema";

export const technicalReportFields = [
  "sequence", "project", "errorDescription", "affectedSystem", "reportTime",
  "agentReported", "itReceivedTime", "itCompletedTime", "handler", "itResult",
  "customerServiceTest", "complaintEscalation", "totalProcessingTime",
] as const;

export type TechnicalReportInput = Omit<typeof technicalReports.$inferInsert, "id" | "createdAt" | "updatedAt">;

export function toTechnicalReportInput(value: unknown): TechnicalReportInput | null {
  const body = (value ?? {}) as Record<string, unknown>;
  const sequenceValue = Number(body.sequence ?? 0);
  return {
    sequence: Number.isInteger(sequenceValue) ? sequenceValue : 0,
    project: String(body.project ?? "").trim(),
    errorDescription: String(body.errorDescription ?? "").trim(),
    affectedSystem: String(body.affectedSystem ?? "").trim(),
    reportTime: String(body.reportTime ?? "").trim(),
    agentReported: String(body.agentReported ?? "").trim(),
    itReceivedTime: String(body.itReceivedTime ?? "").trim(),
    itCompletedTime: String(body.itCompletedTime ?? "").trim(),
    handler: String(body.handler ?? "").trim(),
    itResult: String(body.itResult ?? "").trim(),
    customerServiceTest: String(body.customerServiceTest ?? "").trim(),
    complaintEscalation: String(body.complaintEscalation ?? "").trim(),
    totalProcessingTime: String(body.totalProcessingTime ?? "").trim(),
    status: String(body.status ?? "Chưa xử lý").trim() || "Chưa xử lý",
  };
}

export async function listTechnicalReports(page = 1, pageSize = 15, options: { search?: string; project?: string; status?: string; reportFrom?: string; reportTo?: string } = {}) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(100, Math.max(1, pageSize));
  const query = (options.search || "").trim();
  const filters = [];
  if (query) filters.push(or(ilike(technicalReports.project, `%${query}%`), ilike(technicalReports.errorDescription, `%${query}%`), ilike(technicalReports.affectedSystem, `%${query}%`), ilike(technicalReports.handler, `%${query}%`), ilike(technicalReports.itResult, `%${query}%`)));
  if (options.project) filters.push(eq(technicalReports.project, options.project));
  if (options.status) filters.push(eq(technicalReports.status, options.status));
  const reportDate = sql`CASE WHEN ${technicalReports.reportTime} ~ '^[0-9]{2}:[0-9]{2} [0-9]{2}/[0-9]{2}/[0-9]{4}$' THEN to_timestamp(${technicalReports.reportTime}, 'HH24:MI DD/MM/YYYY') END`;
  if (options.reportFrom) filters.push(sql`${reportDate} >= ${options.reportFrom}::date`);
  if (options.reportTo) filters.push(sql`${reportDate} < (${options.reportTo}::date + interval '1 day')`);
  const filter = filters.length ? and(...filters) : undefined;
  const [rows, count] = await Promise.all([
    getDb().select().from(technicalReports).where(filter).orderBy(desc(technicalReports.updatedAt), desc(technicalReports.id)).limit(safePageSize).offset((safePage - 1) * safePageSize),
    getDb().select({ total: sql<number>`count(*)` }).from(technicalReports).where(filter),
  ]);
  return { rows, total: Number(count[0]?.total ?? 0), page: safePage, pageSize: safePageSize };
}

export async function getTechnicalReportStats(options: { project?: string; reportFrom?: string; reportTo?: string } = {}) {
  const filters = [];
  if (options.project) filters.push(eq(technicalReports.project, options.project));
  const reportDate = sql`CASE WHEN ${technicalReports.reportTime} ~ '^[0-9]{2}:[0-9]{2} [0-9]{2}/[0-9]{2}/[0-9]{4}$' THEN to_timestamp(${technicalReports.reportTime}, 'HH24:MI DD/MM/YYYY') END`;
  if (options.reportFrom) filters.push(sql`${reportDate} >= ${options.reportFrom}::date`);
  if (options.reportTo) filters.push(sql`${reportDate} < (${options.reportTo}::date + interval '1 day')`);
  const filter = filters.length ? and(...filters) : undefined;
  const [summary, projects, systems] = await Promise.all([
    getDb().select({ total: sql<number>`count(*)`, pending: sql<number>`count(*) filter (where ${technicalReports.status} = 'Chưa xử lý')` }).from(technicalReports).where(filter),
    getDb().select({ project: technicalReports.project, total: sql<number>`count(*)` }).from(technicalReports).where(filter).groupBy(technicalReports.project).orderBy(sql`count(*) desc`),
    getDb().select({ system: technicalReports.affectedSystem, total: sql<number>`count(*)` }).from(technicalReports).where(filter).groupBy(technicalReports.affectedSystem).orderBy(sql`count(*) desc`),
  ]);
  return { total: Number(summary[0]?.total ?? 0), pending: Number(summary[0]?.pending ?? 0), projects: projects.map((item) => ({ project: item.project || "Chưa xác định", total: Number(item.total) })), systems: systems.map((item) => ({ system: item.system || "Chưa xác định", total: Number(item.total) })) };
}

export async function createTechnicalReport(input: TechnicalReportInput) {
  const [row] = await getDb().insert(technicalReports).values(input).returning();
  return row;
}

export async function updateTechnicalReport(id: number, input: TechnicalReportInput) {
  const [row] = await getDb().update(technicalReports).set({ ...input, updatedAt: new Date() }).where(eq(technicalReports.id, id)).returning();
  return row ?? null;
}

export async function deleteTechnicalReport(id: number) {
  const [row] = await getDb().delete(technicalReports).where(eq(technicalReports.id, id)).returning({ id: technicalReports.id });
  return row ?? null;
}