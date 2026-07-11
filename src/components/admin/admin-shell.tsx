"use client";

import { AdminInquiriesProvider } from "@/components/admin/admin-inquiries-context";
import { ContactInquiriesSidebar } from "@/components/admin/contact-inquiries-sidebar";
import { InquiriesBell } from "@/components/admin/inquiries-bell";
import { AdminLogoutButton } from "@/app/admin/logout-button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminInquiriesProvider>
      <div className="dark min-h-dvh bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
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
        <ContactInquiriesSidebar />
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</main>
      </div>
    </AdminInquiriesProvider>
  );
}
