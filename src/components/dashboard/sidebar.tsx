"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Contact,
  Kanban,
  LogOut,
  Users,
  CreditCard,
  Zap,
  UserCircle,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/crm", label: "CRM", icon: Kanban },
  { href: "/dashboard/contacts", label: "Contactos", icon: Contact },
  { href: "/dashboard/simulator", label: "Simulador", icon: Zap },
  { href: "/dashboard/integrations", label: "Integraciones", icon: Plug },
  { href: "/dashboard/team", label: "Equipo", icon: Users },
  { href: "/dashboard/subscription", label: "Suscripción", icon: CreditCard },
  { href: "/dashboard/profile", label: "Perfil", icon: UserCircle },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast({ title: "Sesión cerrada" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-5 py-5">
        <Logo href="/dashboard" inverted />
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-muted">
          Menú
        </p>
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.25 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-[13px] text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
