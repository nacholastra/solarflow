export type PlanId = "basic" | "pro";
export type Currency = "EUR" | "USD";

/** Precios base en euros. USD se calcula con el tipo de cambio configurado. */
export const PLANS = {
  basic: {
    id: "basic" as const,
    name: "Basic",
    priceEur: 60,
    leadsLimit: 25,
    teamLimit: 2,
  },
  pro: {
    id: "pro" as const,
    name: "Pro",
    priceEur: 100,
    leadsLimit: 250,
    teamLimit: 5,
  },
} as const;

/** Tipo EUR→USD (ej. 1.09 ≈ 60 € → 65 $). Configurable en Vercel. */
export function getEurToUsdRate(): number {
  const raw = process.env.NEXT_PUBLIC_EUR_TO_USD_RATE ?? "1.09";
  const rate = Number(raw);
  return Number.isFinite(rate) && rate > 0 ? rate : 1.09;
}

export function getPlanPrice(plan: PlanId, currency: Currency): number {
  const eur = PLANS[plan].priceEur;
  if (currency === "EUR") return eur;
  return Math.round(eur * getEurToUsdRate());
}

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
