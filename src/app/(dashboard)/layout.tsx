import type { Metadata } from "next";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { DashboardProvider } from "@/components/dashboard/dashboard-provider";
import { requireDashboardContext } from "@/lib/dashboard/session";
import { PRIVATE_PAGE_ROBOTS } from "@/lib/config/seo";

export const metadata: Metadata = {
  robots: PRIVATE_PAGE_ROBOTS,
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const context = await requireDashboardContext();

  return (
    <DashboardProvider value={context}>
      <div className="flex h-dvh overflow-hidden bg-background">
        <DashboardSidebar empresaNombre={context.empresaNombre} plan={context.plan} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <MobileNav />
          <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
