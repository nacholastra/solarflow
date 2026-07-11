"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminInquiries } from "@/components/admin/admin-inquiries-context";

export function InquiriesBell() {
  const { hasNewAlert, clearNewAlert } = useAdminInquiries();

  if (!hasNewAlert) {
    return (
      <div
        className="flex size-9 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-500"
        aria-label="Sin mensajes nuevos"
        title="Sin mensajes nuevos"
      >
        <Bell className="size-4" />
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "relative flex size-9 items-center justify-center rounded-md border border-solar/40 bg-solar/10 text-solar",
        "ring-2 ring-solar/50 ring-offset-2 ring-offset-background",
      )}
      aria-label="Nuevo mensaje de contacto. Pulsa para marcar como visto."
      title="Nuevo mensaje — pulsa para marcar como visto"
      onClick={clearNewAlert}
    >
      <Bell className="size-4 animate-pulse" />
      <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-solar" aria-hidden />
    </button>
  );
}
