"use client";

import { AdminInquiriesProvider } from "@/components/admin/admin-inquiries-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminInquiriesProvider>
      <div className="dark flex h-dvh overflow-hidden bg-background">
        <AdminSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/35 dark:bg-background">
          <AdminMobileNav />
          <main className="flex-1 overflow-y-auto overscroll-y-contain px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>
      </div>
    </AdminInquiriesProvider>
  );
}
