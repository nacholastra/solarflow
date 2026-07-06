import { PLANS, type PlanId } from "./plans";

export function isProPlan(plan: string | null | undefined): plan is "pro" {
  return plan === "pro";
}

export function getTeamLimit(plan: string | null | undefined): number {
  if (plan === "pro") return PLANS.pro.teamLimit;
  return PLANS.basic.teamLimit;
}

export function canExportCsv(plan: string | null | undefined): boolean {
  return isProPlan(plan);
}

export function canUseWebhooks(plan: string | null | undefined): boolean {
  return isProPlan(plan);
}

export function canUseGtm(plan: string | null | undefined): boolean {
  return isProPlan(plan);
}

export function showWidgetWatermark(plan: string | null | undefined): boolean {
  return !isProPlan(plan);
}

/** Campos Pro que se limpian al activar o permanecer en Basic. */
export const PRO_ONLY_EMPRESA_FIELDS = {
  gtm_id: null,
  webhook_url: null,
} as const;

export function planLabel(plan: PlanId | null | undefined): string {
  if (plan === "pro") return "Pro";
  if (plan === "basic") return "Basic";
  return "Sin plan";
}
