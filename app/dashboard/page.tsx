"use client";

import { DashboardContent } from "@/components/dashboard/DashboardContent";

export default function Dashboard() {
  // Auth gate lives in app/dashboard/layout.tsx — avoid a second skeleton under the shell.
  return <DashboardContent />;
}
