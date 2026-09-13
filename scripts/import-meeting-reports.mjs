import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as XLSX from "xlsx";
config({ path: ".env.local" });
if (!process.env.CRM_DATABASE_URL) throw new Error("CRM_DATABASE_URL is required");
const sql = neon(process.env.CRM_DATABASE_URL);
const url = "https://docs.google.com/spreadsheets/d/1ROWQ8BSj---Oi4FcLM7EK-qCyrP_3xKOZKaRSB1Ssy4/export?format=csv&gid=1067408258";
const response = await fetch(url); if (!response.ok) throw new Error(`Sheet download failed: ${response.status}`);
const workbook = XLSX.read(await response.text(), { type: "string" });
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
const headerIndex = rows.findIndex((row) => row.some((cell) => String(cell).includes("TEAM DỰ ÁN")));
const dataRows = rows.slice(headerIndex + 1);
let currentTeam = "";
const teamNames = new Set(["BIDV", "Techcom Life", "Techcombank", "Vietcombank", "Vietinbank", "UOB"]);
const records = [];
for (const row of dataRows) {
  const first = String(row[0] ?? "").trim();
  const second = String(row[1] ?? "").trim();
  if (first && !second && teamNames.has(first)) currentTeam = first;
  const reportContent = [first && (!teamNames.has(first) || second) ? first : "", second].filter(Boolean).join(" ");
  const values = [reportContent, String(row[2] ?? "").trim(), String(row[3] ?? "").trim(), String(row[4] ?? "").trim()];
  if (currentTeam && values.some(Boolean)) records.push({ team: currentTeam, reportContent: values[0], complaints: values[1], proposal: values[2], afterMeetingAction: values[3] });
}
const replace = process.argv.includes("--replace");
const existing = await sql`SELECT count(*)::int AS total FROM meeting_reports`;
if (Number(existing[0]?.total ?? 0) && !replace) { console.log("meeting_reports already contains data; import skipped."); process.exit(0); }
if (replace) await sql`TRUNCATE TABLE meeting_reports RESTART IDENTITY`;
for (const record of records) await sql`INSERT INTO meeting_reports (team, report_content, complaints, proposal, after_meeting_action) VALUES (${record.team}, ${record.reportContent}, ${record.complaints}, ${record.proposal}, ${record.afterMeetingAction})`;
console.log(`Imported ${records.length} meeting reports.`);
