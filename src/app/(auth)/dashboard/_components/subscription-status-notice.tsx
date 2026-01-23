import { addDays, differenceInDays } from "date-fns";
import { CircleAlert, PartyPopper, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getSession } from "@/lib/getSession";
import {
  TRIAL_BUDGET_LIMIT,
  TRIAL_DAYS,
  TRIAL_SERVICES_LIMIT,
} from "@/utils/permissions/trial-limits";
import { getSubscription } from "../_data-access/get-subscriptio";

export async function SubscriptionStatusNotice() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  if (!session?.user?.id) {
    return null;
  }

  const subscription = await getSubscription(session.user.id);

  let message = "";
  let icon = <PartyPopper className="h-6 w-6 text-green-500" />;
  let cardClass = "bg-green-500/10 border-green-500/20";

  if (subscription && subscription.status === "active") {
    const expiryDate = subscription.stripeCurrentPeriodEnd;
    if (expiryDate) {
      const daysRemaining = differenceInDays(expiryDate, new Date());
      if (daysRemaining <= 7) {
        message = `Seu plano ${subscription.plan} expira em ${daysRemaining} dia(s).`;
        icon = <CircleAlert className="h-6 w-6 text-yellow-500" />;
        cardClass = "bg-yellow-500/10 border-yellow-500/20";
      } else {
        message = `Seu plano ${subscription.plan} está ativo.`;
      }
    }
  } else {
    // Trial user
    const trialEndDate = addDays(new Date(session.user.createdAt), TRIAL_DAYS);
    const daysRemaining = differenceInDays(trialEndDate, new Date());

    if (daysRemaining <= 0) {
      message = "Seu período de teste expirou.";
      icon = <CircleAlert className="h-6 w-6 text-red-500" />;
      cardClass = "bg-red-500/10 border-red-500/20";
    } else {
      message = `Você está no período de teste. Restam ${daysRemaining} dia(s). Limites: ${TRIAL_BUDGET_LIMIT} orçamentos e ${TRIAL_SERVICES_LIMIT} ordens de serviço.`;
      icon = <Rocket className="h-6 w-6 text-blue-500" />;
      cardClass = "bg-blue-500/10 border-blue-500/20";
    }
  }

  if (!message) {
    return null;
  }

  return (
    <Card
      className={`relative z-10 max-w-7xl mx-auto p-4 mb-8 flex items-center space-x-4 ${cardClass}`}
    >
      {icon}
      <p className="text-white">{message}</p>
    </Card>
  );
}
