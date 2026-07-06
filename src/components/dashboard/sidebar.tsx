"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Contact,
  CreditCard,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  MonitorSmartphone,
  User,
  Users,
  Webhook,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

const nav = [
  { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "CRM", href: "/dashboard/crm", icon: KanbanSquare },
  { label: "Simulador", href: "/dashboard/simulator", icon: MonitorSmartphone },
  { label: "Contactos", href: "/dashboard/contacts", icon: Contact },
  { label: "Integraciones", href: "/dashboard/integrations", icon: Webhook },
  { label: "Equipo", href: "/dashboard/team", icon: Users },
];

const account = [
  { label: "Suscripción", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Mi perfil", href: "/dashboard/profile", icon: User },
];

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SF";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
}

export function DashboardSidebar({
  empresaNombre,
  plan,
}: {
  empresaNombre: string;
  plan: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast({ title: "Sesión cerrada" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Logo href="/dashboard" inverted />
      </div>

      <nav
        aria-label="Navegación del panel"
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5"
      >
        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/40">
            General
          </p>
          {nav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/40">
            Cuenta
          </p>
          {account.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
            {getInitials(empresaNombre)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{empresaNombre}</p>
            <p className="truncate text-xs capitalize text-sidebar-foreground/50">
              Plan {plan ?? "sin activar"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar sesión"
            onClick={handleLogout}
            className="rounded-md p-1.5 text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
