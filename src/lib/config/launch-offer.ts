import { TRIAL_DAYS } from "@/lib/config/trial";

/** Oferta de lanzamiento: descuento para los primeros N clientes + trial. */
export const LAUNCH_OFFER = {
  earlyBirdLimit: 20,
  discountPercent: 30,
  trialDays: TRIAL_DAYS,
} as const;

export function applyDiscount(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100));
}

export function getLaunchSlotsRemaining(earlyBirdUsed: number): number {
  return Math.max(0, LAUNCH_OFFER.earlyBirdLimit - earlyBirdUsed);
}
