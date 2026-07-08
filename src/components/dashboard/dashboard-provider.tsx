"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DashboardContext } from "@/lib/dashboard/session";

type DashboardContextValue = DashboardContext & {
  refreshPlan: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({
  value: initial,
  children,
}: {
  value: DashboardContext;
  children: React.ReactNode;
}) {
  const [plan, setPlan] = useState(initial.plan);
  const supabase = useMemo(() => createClient(), []);

  const refreshPlan = useCallback(async () => {
    const { data } = await supabase
      .from("empresas")
      .select("plan")
      .eq("id", initial.empresaId)
      .single();
    if (data) setPlan(data.plan ?? null);
  }, [initial.empresaId, supabase]);

  useEffect(() => {
    setPlan(initial.plan);
  }, [initial.plan]);

  const value = useMemo(
    () => ({ ...initial, plan, refreshPlan }),
    [initial, plan, refreshPlan],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext debe usarse dentro del panel");
  }
  return ctx;
}
