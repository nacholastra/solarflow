"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Contact,
  CreditCard,
  KanbanSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorSmartphone,
  User,
  Users,
  Webhook,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

const links = [
  { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "CRM", href: "/dashboard/crm", icon: KanbanSquare },
  { label: "Simulador", href: "/dashboard/simulator", icon: MonitorSmartphone },
  { label: "Contactos", href: "/dashboard/contacts", icon: Contact },
  { label: "Integraciones", href: "/dashboard/integrations", icon: Webhook },
  { label: "Equipo", href: "/dashboard/team", icon: Users },
  { label: "Suscripción", href: "/dashboard/subscription", icon: CreditCard },
  { label: "Mi perfil", href: "/dashboard/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

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
    <div className="shrink-0 lg:hidden">
      <div className="flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4">
        <Logo href="/dashboard" inverted />
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

      {open && (
        <nav
          aria-label="Navegación del panel"
          className="flex flex-col gap-1 border-b border-sidebar-border bg-sidebar px-3 py-3"
        >
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
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
