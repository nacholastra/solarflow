import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";
import { getLaunchOfferStatus } from "@/lib/config/launch-offer-status";

export default async function RegisterPage() {
  const offer = await getLaunchOfferStatus();

  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted" />}>
      <RegisterForm offer={offer} />
    </Suspense>
  );
}
