import Link from "next/link";
import { TRIAL_DAYS } from "@/lib/config/trial";
import type { LaunchOfferStatus } from "@/lib/config/launch-offer-status";

export function LaunchOfferBanner({ offer }: { offer: LaunchOfferStatus }) {
  if (!offer.active) {
    return (
      <div className="border-b border-border bg-muted/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 px-4 py-2.5 text-center text-sm text-muted-foreground md:flex-row md:gap-3 md:px-6">
          <span className="font-medium text-foreground">Para instaladoras en España</span>
          <span>
            {TRIAL_DAYS} días de prueba gratuita · Sin permanencia
          </span>
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Empezar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-solar/30 bg-solar/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 px-4 py-2.5 text-center text-sm md:flex-row md:gap-3 md:px-6">
        <p className="font-medium text-foreground">
          España · Oferta de lanzamiento: {offer.trialDays} días gratis + {offer.discountPercent}% dto.
          para los {offer.earlyBirdLimit} primeros
        </p>
        <p className="text-muted-foreground">
          Quedan {offer.slotsRemaining} plaza{offer.slotsRemaining === 1 ? "" : "s"}
          {" · "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Reservar mi plaza
          </Link>
        </p>
      </div>
    </div>
  );
}
