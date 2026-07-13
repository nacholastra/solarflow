import { cache } from "react";
import { createServiceClient } from "@/lib/supabase/server";
import {
  LAUNCH_OFFER,
  getLaunchSlotsRemaining,
} from "@/lib/config/launch-offer";

export type LaunchOfferStatus = {
  active: boolean;
  trialDays: number;
  discountPercent: number;
  earlyBirdLimit: number;
  slotsUsed: number;
  slotsRemaining: number;
};

export const getLaunchOfferStatus = cache(async (): Promise<LaunchOfferStatus> => {
  let slotsUsed = 0;

  try {
    const supabase = await createServiceClient();
    const { count } = await supabase
      .from("empresas")
      .select("*", { count: "exact", head: true })
      .eq("early_bird", true);
    slotsUsed = count ?? 0;
  } catch (e) {
    console.warn("getLaunchOfferStatus:", e);
  }

  const slotsRemaining = getLaunchSlotsRemaining(slotsUsed);

  return {
    active: slotsRemaining > 0,
    trialDays: LAUNCH_OFFER.trialDays,
    discountPercent: LAUNCH_OFFER.discountPercent,
    earlyBirdLimit: LAUNCH_OFFER.earlyBirdLimit,
    slotsUsed,
    slotsRemaining,
  };
});
