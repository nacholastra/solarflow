"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { adminNav, isAdminNavActive } from "@/lib/admin/nav";
import { useAdminInquiries } from "@/components/admin/admin-inquiries-context";
import { InquiriesBell } from "@/components/admin/inquiries-bell";

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  badge,
  highlight,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  badge?: number;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-l-2 border-sidebar-primary bg-sidebar-accent pl-[10px] text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        highlight && !active && "ring-1 ring-solar/40",
      )}
    >
      <Icon className={cn("size-4 shrink-0", highlight && "text-solar")} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="rounded-full bg-solar px-1.5 py-0.5 text-[10px] font-semibold text-solar-foreground">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { pendingCount, hasNewAlert } = useAdminInquiries();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="hidden h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Logo href="/admin" inverted />
        <InquiriesBell compact />
      </div>

      <nav aria-label="Administración" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/40">
          Panel
        </p>
        {adminNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isAdminNavActive(pathname, item.href, "exact" in item && item.exact)}
            badge={item.href === "/admin/mensajes" ? pendingCount : undefined}
            highlight={item.href === "/admin/mensajes" && hasNewAlert}
          />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
