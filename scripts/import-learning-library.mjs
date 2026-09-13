import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as XLSX from "xlsx";

config({ path: ".env.local" });
const connectionString = process.env.CRM_DATABASE_URL;
if (!connectionString) throw new Error("CRM_DATABASE_URL is required");
const sql = neon(connectionString);
const source = "https://docs.google.com/spreadsheets/d/1zC1--r4Pr1lnAIFAgixM4DdPr354XcFioZtNcprL4iI/export?format=csv&gid=";
const sheets = [
  ["BIDV", "1607922852"], ["VietcomBank", "1104570466"], ["VietinBank", "1104434873"],
  ["TechcomBank", "1439531698"], ["UOB", "430096608"], ["TechcomLife", "1011891642"], ["Elite", "898196376"],
];

function text(value) { return String(value ?? "").trim(); }
function field(headers, names) { return headers.findIndex((header) => names.some((name) => header.includes(name))); }

for (const [project, gid] of sheets) {
  const response = await fetch(`${source}${gid}`);
  if (!response.ok) throw new Error(`${project}: sheet download failed (${response.status})`);
  const workbook = XLSX.read(await response.text(), { type: "string" });
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
  const headerIndex = rows.findIndex((row) => row.some((cell) => text(cell).includes("Tên chương trình")));
  if (headerIndex < 0) throw new Error(`${project}: header row not found`);
  const headers = rows[headerIndex].map((cell) => text(cell));
  const indexes = {
    programName: field(headers, ["Tên chương trình"]), question: field(headers, ["Câu hỏi/tình huống"]), answer: field(headers, ["Câu trả lời chuẩn"]),
    agentSteps: field(headers, ["Các bước Agent"]), escalationGuidance: field(headers, ["Khi nào cần báo"]), trainingNotes: field(headers, ["Ghi chú đào tạo"]), questionLevel: field(headers, ["Cấp độ câu hỏi"]),
  };
  const records = rows.slice(headerIndex + 1).map((row) => ({
    programName: text(row[indexes.programName]), question: text(row[indexes.question]), answer: text(row[indexes.answer]), agentSteps: text(row[indexes.agentSteps]), escalationGuidance: text(row[indexes.escalationGuidance]), trainingNotes: text(row[indexes.trainingNotes]), questionLevel: text(row[indexes.questionLevel]),
  })).filter((row) => row.programName || row.question || row.answer);
  const existing = await sql`SELECT c.id, count(l.id)::int AS lesson_count FROM courses c LEFT JOIN lessons l ON l.course_id = c.id WHERE lower(c.title) = lower(${project}) GROUP BY c.id ORDER BY lesson_count DESC, c.id LIMIT 1`;
  let courseId;
  if (existing.length) {
    courseId = existing[0].id;
    await sql`UPDATE courses SET title = ${project}, description = ${`Thư viện chương trình đặc quyền ${project}`}, category = 'Đào tạo nội bộ', level = 'Nhiều cấp độ', updated_at = now() WHERE id = ${courseId}`;
    await sql`DELETE FROM lessons WHERE course_id = ${courseId}`;
  } else {
    const created = await sql`INSERT INTO courses (title, description, category, level, status, cover_color) VALUES (${project}, ${`Thư viện chương trình đặc quyền ${project}`}, 'Đào tạo nội bộ', 'Nhiều cấp độ', 'published', 'blue') RETURNING id`;
    courseId = created[0].id;
  }
  for (const [index, record] of records.entries()) {
    await sql`INSERT INTO lessons (course_id, title, content, program_name, agent_steps, escalation_guidance, training_notes, question_level, position) VALUES (${courseId}, ${record.question}, ${record.answer}, ${record.programName}, ${record.agentSteps}, ${record.escalationGuidance}, ${record.trainingNotes}, ${record.questionLevel}, ${index + 1})`;
  }
  await sql`DELETE FROM courses WHERE lower(title) = lower(${project}) AND id <> ${courseId} AND NOT EXISTS (SELECT 1 FROM lessons WHERE lessons.course_id = courses.id)`;
  console.log(`${project}: ${records.length} lessons imported`);
}
