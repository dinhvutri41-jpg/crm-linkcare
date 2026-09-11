import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

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
  resolution: text("resolution").notNull().default(""),
  compensation: text("compensation").notNull().default(""),
  damage: text("damage").notNull().default(""),
  errorType: text("error_type").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Complaint = typeof complaints.$inferSelect;
export type NewComplaint = typeof complaints.$inferInsert;
