import { BackgroundAnimation } from "@/utils/backgroud";
import { DashboardStats } from "./_components/dashboard-stats";
import { SubscriptionStatusNotice } from "./_components/subscription-status-notice";
import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <BackgroundAnimation />
      <div className="relative z-10">
        <DashboardClient>
          <DashboardStats />
        </DashboardClient>
        <SubscriptionStatusNotice />
      </div>
    </div>
  );
}
