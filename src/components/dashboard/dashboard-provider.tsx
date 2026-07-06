"use client";

import { createContext, useContext } from "react";
import type { DashboardContext } from "@/lib/dashboard/session";

const DashboardContext = createContext<DashboardContext | null>(null);

export function DashboardProvider({
  value,
  children,
}: {
  value: DashboardContext;
  children: React.ReactNode;
}) {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext(): DashboardContext {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext debe usarse dentro del panel");
  }
  return ctx;
}
