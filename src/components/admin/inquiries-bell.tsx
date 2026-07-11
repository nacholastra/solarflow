"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAdminInquiries } from "@/components/admin/admin-inquiries-context";

export function InquiriesBell() {
  const { pendingCount, hasNewAlert, toggleSidebar, sidebarOpen } = useAdminInquiries();

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "relative border-neutral-700 bg-neutral-900",
        hasNewAlert && "ring-2 ring-solar/60 ring-offset-2 ring-offset-background",
      )}
      aria-label={
        pendingCount > 0
          ? `${pendingCount} consulta${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"}`
          : "Ver mensajes de contacto"
      }
      aria-expanded={sidebarOpen}
      onClick={toggleSidebar}
    >
      <Bell className={cn("size-4", hasNewAlert && "animate-pulse text-solar")} />
      {pendingCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-solar px-1 text-[10px] font-semibold text-solar-foreground">
          {pendingCount > 99 ? "99+" : pendingCount}
        </span>
      )}
    </Button>
  );
}
