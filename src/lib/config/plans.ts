export type PlanId = "basic" | "pro";
export type Currency = "EUR" | "USD";

export const PLANS = {
  basic: {
    id: "basic" as const,
    name: "Basic",
    price: 60,
    leadsLimit: 25,
    teamLimit: 2,
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    price: 100,
    leadsLimit: 250,
    teamLimit: 5,
  },
} as const;

export function getPayPalPlanId(plan: PlanId, currency: Currency): string | undefined {
  const envMap: Record<PlanId, Record<Currency, string | undefined>> = {
    basic: {
      EUR: process.env.PAYPAL_PLAN_ID_BASIC_EUR,
      USD: process.env.PAYPAL_PLAN_ID_BASIC_USD,
    },
    pro: {
      EUR: process.env.PAYPAL_PLAN_ID_PRO_EUR,
      USD: process.env.PAYPAL_PLAN_ID_PRO_USD,
    },
  };
  return envMap[plan][currency];
}

export function getLeadsLimit(plan: PlanId): number {
  return PLANS[plan].leadsLimit;
}
