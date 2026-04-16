import { DashboardStats } from "./_components/dashboard-stats";
import { SubscriptionStatusNotice } from "./_components/subscription-status-notice";
import DashboardClient from "./dashboard-client";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white font-poppins">
          Dashboard <span className="text-primary">Overview</span>
        </h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
          Desempenho em tempo real da sua oficina
        </p>
      </div>
      
      <DashboardClient>
        <DashboardStats />
      </DashboardClient>
      
      <SubscriptionStatusNotice />
    </div>
  );
}
