import { AppShell } from "@/components/app-shell";
import { TechnicalReportsCrud } from "@/components/technical-reports-crud";

export default function TechnicalReportsPage() {
  return (
    <AppShell>
      <TechnicalReportsCrud />
    </AppShell>
  );
}