import { boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const complaints = pgTable("complaints", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sourceSheet: varchar("source_sheet", { length: 160 }).notNull().default("manual"),
  project: varchar("project", { length: 200 }).notNull().default("Không xác định"),
  receivedDate: text("received_date").notNull(),
  month: varchar("month", { length: 7 }).notNull(),
  customer: text("customer").notNull().default(""),
  bookingCode: varchar("booking_code", { length: 160 }).notNull().default(""),
  privilege: text("privilege").notNull().default(""),
  usageDate: text("usage_date").notNull().default(""),
  provider: text("provider").notNull().default(""),
  complaintContent: text("complaint_content").notNull().default(""),
  cskhExplanation: text("cskh_explanation").notNull().default(""),
  responsibleEmployee: text("responsible_employee").notNull().default(""),
  resolution: text("resolution").notNull().default(""),
  compensation: text("compensation").notNull().default(""),
  damage: text("damage").notNull().default(""),
  errorType: text("error_type").notNull().default(""),
  improvementProposal: text("improvement_proposal").notNull().default(""),
  managementOpinion: text("management_opinion").notNull().default(""),
  teamLeaderOpinion: text("team_leader_opinion").notNull().default(""),
  managementResolved: boolean("management_resolved").notNull().default(false),
  status: varchar("status", { length: 30 }).notNull().default("Chưa xử lý"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Complaint = typeof complaints.$inferSelect;
export type NewComplaint = typeof complaints.$inferInsert;

export const courses = pgTable("courses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title", { length: 240 }).notNull(),
  description: text("description").notNull().default(""),
  category: varchar("category", { length: 120 }).notNull().default("Đào tạo nội bộ"),
  level: varchar("level", { length: 40 }).notNull().default("Cơ bản"),
  status: varchar("status", { length: 30 }).notNull().default("draft"),
  coverColor: varchar("cover_color", { length: 20 }).notNull().default("blue"),
  agentSteps: text("agent_steps").notNull().default(""),
  escalationGuidance: text("escalation_guidance").notNull().default(""),
  trainingNotes: text("training_notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 240 }).notNull(),
  content: text("content").notNull().default(""),
  durationMinutes: integer("duration_minutes").notNull().default(10),
  position: integer("position").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
