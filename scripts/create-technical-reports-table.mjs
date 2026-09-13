import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const connectionString = process.env.CRM_DATABASE_URL;
if (!connectionString) throw new Error("CRM_DATABASE_URL is required");

const sql = neon(connectionString);
await sql`
  CREATE TABLE IF NOT EXISTS technical_reports (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sequence integer NOT NULL DEFAULT 0,
    project varchar(200) NOT NULL DEFAULT '',
    error_description text NOT NULL DEFAULT '',
    affected_system varchar(240) NOT NULL DEFAULT '',
    report_time text NOT NULL DEFAULT '',
    agent_reported text NOT NULL DEFAULT '',
    it_received_time text NOT NULL DEFAULT '',
    it_completed_time text NOT NULL DEFAULT '',
    handler varchar(200) NOT NULL DEFAULT '',
    it_result text NOT NULL DEFAULT '',
    customer_service_test varchar(40) NOT NULL DEFAULT '',
    complaint_escalation varchar(80) NOT NULL DEFAULT '',
    total_processing_time varchar(80) NOT NULL DEFAULT '',
    status varchar(30) NOT NULL DEFAULT 'Chưa xử lý',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  )
`;
await sql`ALTER TABLE technical_reports ALTER COLUMN customer_service_test TYPE text`;
await sql`ALTER TABLE technical_reports ALTER COLUMN complaint_escalation TYPE text`;
await sql`ALTER TABLE technical_reports ALTER COLUMN total_processing_time TYPE text`;
await sql`ALTER TABLE technical_reports ADD COLUMN IF NOT EXISTS status varchar(30) NOT NULL DEFAULT 'Chưa xử lý'`;

console.log("technical_reports table is ready.");
