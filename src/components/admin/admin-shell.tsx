"use client";

import { AdminInquiriesProvider } from "@/components/admin/admin-inquiries-context";
import { ContactInquiriesSidebar } from "@/components/admin/contact-inquiries-sidebar";
import { InquiriesBell } from "@/components/admin/inquiries-bell";
import { AdminLogoutButton } from "@/app/admin/logout-button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminInquiriesProvider>
      <div className="dark flex min-h-dvh flex-col bg-background text-foreground">
        <header className="sticky top-0 z-30 shrink-0 border-b border-border bg-background/95 px-4 py-4 backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Administración
              </p>
              <h1 className="text-lg font-semibold">Panel de control</h1>
            </div>
            <div className="flex items-center gap-2">
              <InquiriesBell />
              <AdminLogoutButton />
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
          <ContactInquiriesSidebar />
        </div>
      </div>
    </AdminInquiriesProvider>
  );
}
