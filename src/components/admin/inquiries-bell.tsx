"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminInquiries } from "@/components/admin/admin-inquiries-context";

export function InquiriesBell({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { hasNewAlert, clearNewAlert } = useAdminInquiries();

  if (!hasNewAlert) {
    if (compact) return null;
    return (
      <div
        className="flex size-9 items-center justify-center rounded-md text-sidebar-foreground/40"
        aria-label="Sin mensajes nuevos"
        title="Sin mensajes nuevos"
      >
        <Bell className="size-4" />
      </div>
    );
  }

  function handleClick() {
    clearNewAlert();
    router.push("/admin/mensajes");
  }

  return (
    <button
      type="button"
      className={cn(
        "relative flex size-9 items-center justify-center rounded-md border border-solar/40 bg-solar/10 text-solar",
        "ring-2 ring-solar/50 ring-offset-2 ring-offset-sidebar",
      )}
      aria-label="Nuevo mensaje. Ir a Mensajes."
      title="Nuevo mensaje — ir a Mensajes"
      onClick={handleClick}
    >
      <Bell className="size-4 animate-pulse" />
      <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-solar" aria-hidden />
    </button>
  );
}
