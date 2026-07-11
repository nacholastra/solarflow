"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { adminNav, isAdminNavActive } from "@/lib/admin/nav";
import { useAdminInquiries } from "@/components/admin/admin-inquiries-context";
import { InquiriesBell } from "@/components/admin/inquiries-bell";

export function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { pendingCount, hasNewAlert } = useAdminInquiries();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="shrink-0 lg:hidden">
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4">
        <Logo href="/admin" inverted />
        <div className="flex items-center gap-1">
          <InquiriesBell compact />
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Administración"
          className="flex flex-col gap-1 border-b border-sidebar-border bg-sidebar px-3 py-3"
        >
          {adminNav.map((item) => {
            const active = isAdminNavActive(pathname, item.href, "exact" in item && item.exact);
            const isMensajes = item.href === "/admin/mensajes";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                <span className="flex flex-1 items-center gap-2">
                  {item.label}
                  {isMensajes && hasNewAlert && (
                    <span
                      className="size-2 shrink-0 rounded-full bg-red-500"
                      title="Nuevo mensaje"
                      aria-label="Nuevo mensaje"
                    />
                  )}
                </span>
                {isMensajes && pendingCount > 0 && (
                  <span className="rounded-full bg-neutral-700 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-200">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </nav>
      )}
    </div>
  );
}
