import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkCare CRM",
  description: "Complaint and service operations CRM for LinkCare",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi" suppressHydrationWarning><body>{children}</body></html>;
}
