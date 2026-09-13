import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIP BOOKING 24H",
  description: "Complaint and service operations CRM for VIP BOOKING 24H",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi" suppressHydrationWarning><body>{children}</body></html>;
}
