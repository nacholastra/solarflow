import { isAdminAuthenticated } from "@/lib/admin/guard";
import { PRIVATE_PAGE_ROBOTS } from "@/lib/config/seo";
import { AdminShell } from "@/components/admin/admin-shell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración",
  robots: PRIVATE_PAGE_ROBOTS,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
