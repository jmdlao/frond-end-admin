"use client";

import DashboardHeader from "@/app/components/dashboard-header";
import KPICards from "@/app/components/kpi-cards";

export default function DashboardPage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
      <div className="space-y-6">
        <DashboardHeader onRefresh={handleRefresh} />
        <KPICards />
      </div>
  );
}