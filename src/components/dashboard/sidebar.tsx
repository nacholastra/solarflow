"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Contact,
  Kanban,
  LogOut,
  Sun,
  Users,
  CreditCard,
  Zap,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/config/brand";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/hooks/use-toast";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/dashboard/crm", label: "CRM", icon: Kanban },
  { href: "/dashboard/contacts", label: "Base de Contactos", icon: Contact },
  { href: "/dashboard/simulator", label: "Simulador", icon: Zap },
  { href: "/dashboard/team", label: "Mi Equipo", icon: Users },
  { href: "/dashboard/subscription", label: "Suscripción", icon: CreditCard },
  { href: "/dashboard/profile", label: "Mi Perfil", icon: UserCircle },
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
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b px-6 py-5 font-bold text-lg">
        <Sun className="h-6 w-6 text-amber-500" />
        {BRAND.name}
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
