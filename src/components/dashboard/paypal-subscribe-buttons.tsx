"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import type { PlanId, Currency } from "@/lib/config/plans";

interface PayPalSubscribeButtonsProps {
  clientId: string;
  plan: PlanId;
  currency: Currency;
  empresaId: string;
  onApprove: (subscriptionId: string) => Promise<void>;
  onError: (message: string) => void;
}

export function PayPalSubscribeButtons({
  clientId,
  plan,
  currency,
  empresaId,
  onApprove,
  onError,
}: PayPalSubscribeButtonsProps) {
  return (
    <PayPalScriptProvider
      key={`${plan}-${currency}`}
      options={{
        clientId,
        vault: true,
        intent: "subscription",
        components: "buttons",
        locale: "es_ES",
      }}
    >
      <PayPalButtons
        style={{ layout: "vertical", shape: "rect", label: "subscribe" }}
        createSubscription={async () => {
          const res = await fetch("/api/paypal/create-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan, currency, empresaId }),
          });
          const json = (await res.json()) as { id?: string; error?: string };
          if (!json.id) {
            throw new Error(json.error ?? "No se pudo crear la suscripción");
          }
          return json.id;
        }}
        onApprove={async (data) => {
          if (!data.subscriptionID) {
            onError("PayPal no devolvió un ID de suscripción");
            return;
          }
          await onApprove(data.subscriptionID);
        }}
        onError={(err) => {
          const message =
            err instanceof Error
              ? err.message
              : typeof err === "string"
                ? err
                : "Error al procesar el pago con PayPal";
          onError(message);
        }}
      />
    </PayPalScriptProvider>
  );
}
