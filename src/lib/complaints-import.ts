import * as XLSX from "xlsx";
import type { NewComplaint } from "@/db/schema";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
const text = (value: unknown) => (value == null ? "" : String(value).trim());

function dateValue(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  const valueText = text(value);
  const local = valueText.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (local) return `${local[3]}-${local[2].padStart(2, "0")}-${local[1].padStart(2, "0")}`;
  const iso = valueText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const serial = Number(valueText);
  if (Number.isFinite(serial) && serial > 30000) {
    const date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
    return date.toISOString().slice(0, 10);
  }
  return null;
}

function indexOf(headers: string[], ...terms: string[]): number {
  return headers.findIndex((header) => terms.every((term) => normalize(header).includes(normalize(term))));
}

export function parseComplaintWorkbook(buffer: ArrayBuffer, sourceSheet: string): NewComplaint[] {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const records: NewComplaint[] = [];

  for (const sheetName of workbook.SheetNames) {
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], { header: 1, defval: "", raw: true });
    const headerRow = rows.findIndex((row) => row.some((value) => normalize(text(value)).includes("ngay tiep nhan")));
    if (headerRow < 0) continue;

    const headers = rows[headerRow].map(text);
    const dateIndex = indexOf(headers, "ngay tiep nhan");
    const projectIndex = indexOf(headers, "ten du an");
    const customerIndex = indexOf(headers, "thong tin khach hang");
    const bookingIndex = indexOf(headers, "ma booking");
    const privilegeIndex = indexOf(headers, "loai", "dac quyen");
    const usageIndex = indexOf(headers, "lich su dung");
    const providerIndex = indexOf(headers, "nha cung cap");
    const complaintIndex = indexOf(headers, "noi dung", "khieu nai");
    const resolutionIndex = indexOf(headers, "ket qua xu ly");
    const compensationIndex = indexOf(headers, "qua tang den bu");
    const damageIndex = indexOf(headers, "thiet hai");
    const errorTypeIndex = indexOf(headers, "phan loai loi");
    let currentProject = "Không xác định";

    for (let rowIndex = headerRow + 1; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      const marker = text(row[0]);
      if (normalize(marker).startsWith("du an")) currentProject = marker.replace(/^Dự án\s*/i, "").trim() || currentProject;
      const receivedDate = dateValue(row[dateIndex]);
      if (!receivedDate) continue;
      records.push({
        sourceSheet: `${sourceSheet}/${sheetName}`,
        project: text(row[projectIndex]) || currentProject,
        receivedDate,
        month: receivedDate.slice(0, 7),
        customer: text(row[customerIndex]),
        bookingCode: text(row[bookingIndex]),
        privilege: text(row[privilegeIndex]),
        usageDate: text(row[usageIndex]),
        provider: text(row[providerIndex]),
        complaintContent: text(row[complaintIndex]),
        resolution: text(row[resolutionIndex]),
        compensation: text(row[compensationIndex]),
        damage: text(row[damageIndex]),
        errorType: text(row[errorTypeIndex]),
      });
    }
  }
  return records;
}
