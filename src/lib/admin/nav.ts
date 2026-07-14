import { Building2, Inbox, Gauge } from "lucide-react";

export const adminNav = [
  { label: "Empresas", href: "/admin", icon: Building2, exact: true },
  { label: "Mensajes", href: "/admin/mensajes", icon: Inbox },
  { label: "Tarifas", href: "/admin/tarifas", icon: Gauge },
] as const;

export function isAdminNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
