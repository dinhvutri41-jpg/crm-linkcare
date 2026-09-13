import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
config({ path: ".env.local" });
if (!process.env.CRM_DATABASE_URL) throw new Error("CRM_DATABASE_URL is required");
const sql = neon(process.env.CRM_DATABASE_URL);
await sql`CREATE TABLE IF NOT EXISTS meeting_reports (id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY, team varchar(200) NOT NULL DEFAULT '', report_content text NOT NULL DEFAULT '', complaints text NOT NULL DEFAULT '', proposal text NOT NULL DEFAULT '', after_meeting_action text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`;
console.log("meeting_reports table is ready.");
