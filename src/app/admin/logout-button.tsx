"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-neutral-100"
    >
      <LogOut className="h-4 w-4" />
      Cerrar sesión
    </button>
  );
}
