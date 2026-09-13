import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as XLSX from "xlsx";

config({ path: ".env.local" });

const connectionString = process.env.CRM_DATABASE_URL;
if (!connectionString) throw new Error("CRM_DATABASE_URL is required");

const sql = neon(connectionString);
const sheetUrl = "https://docs.google.com/spreadsheets/d/1T6z_IMxZcOdkYGFserRTOa_8XQ-dEC46I2IwqJHOJGk/export?format=csv&gid=0";
const response = await fetch(sheetUrl);
if (!response.ok) throw new Error(`Could not download sheet: HTTP ${response.status}`);

const workbook = XLSX.read(await response.text(), { type: "string" });
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
const records = rows.slice(2).map((row) => Array.from({ length: 13 }, (_, index) => String(row[index] ?? "").trim())).filter((row) => row[1] || row[2]);
const existing = await sql`SELECT count(*)::int AS total FROM technical_reports`;
const replace = process.argv.includes("--replace");
if (Number(existing[0]?.total ?? 0) > 0 && !replace) {
  console.log("technical_reports already contains data; import skipped.");
  process.exit(0);
}
if (replace) await sql`TRUNCATE TABLE technical_reports RESTART IDENTITY`;

for (const row of records) {
  await sql`
    INSERT INTO technical_reports (
      sequence, project, error_description, affected_system, report_time,
      agent_reported, it_received_time, it_completed_time, handler, it_result,
      customer_service_test, complaint_escalation, total_processing_time
    ) VALUES (
      ${Number(row[0]) || 0}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]},
      ${row[5]}, ${row[6]}, ${row[7]}, ${row[8]}, ${row[9]}, ${row[10]},
      ${row[11]}, ${row[12]}
    )
  `;
}

console.log(`Imported ${records.length} technical reports from the sheet.`);
