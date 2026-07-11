"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "@/hooks/use-toast";

export type ContactInquiry = {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
  telefono: string | null;
  mensaje: string;
  gestionado: boolean;
  created_at: string;
};

type AdminInquiriesContextValue = {
  inquiries: ContactInquiry[];
  pendingCount: number;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  refresh: () => Promise<boolean>;
  patchInquiry: (id: string, patch: Partial<Pick<ContactInquiry, "gestionado">>) => void;
  hasNewAlert: boolean;
  clearNewAlert: () => void;
  dismissBellAlert: () => void;
  newInquiryIds: Set<string>;
};

const AdminInquiriesContext = createContext<AdminInquiriesContextValue | null>(null);

const POLL_MS = 45_000;

export function AdminInquiriesProvider({ children }: { children: React.ReactNode }) {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const [newInquiryIds, setNewInquiryIds] = useState<Set<string>>(new Set());
  const prevPendingRef = useRef<number | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

  const pendingCount = useMemo(
    () => inquiries.filter((q) => !q.gestionado).length,
    [inquiries],
  );

  const setSelectedId = useCallback((id: string | null) => {
    setSelectedIdState(id);
    if (id) {
      setNewInquiryIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        if (next.size === 0) setHasNewAlert(false);
        return next;
      });
    }
  }, []);

  const clearNewAlert = useCallback(() => {
    setHasNewAlert(false);
    setNewInquiryIds(new Set());
  }, []);

  const dismissBellAlert = useCallback(() => {
    setHasNewAlert(false);
  }, []);

  const patchInquiry = useCallback(
    (id: string, patch: Partial<Pick<ContactInquiry, "gestionado">>) => {
      setInquiries((prev) => {
        const next = prev.map((q) => (q.id === id ? { ...q, ...patch } : q));
        prevPendingRef.current = next.filter((q) => !q.gestionado).length;
        return next;
      });
    },
    [],
  );

  const refresh = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/admin/contact-inquiries");
    const json = (await res.json()) as { inquiries?: ContactInquiry[]; error?: string };
    if (!res.ok) return false;

    const next = json.inquiries ?? [];
    const nextPending = next.filter((q) => !q.gestionado).length;

    if (initializedRef.current) {
      const newItems = next.filter((q) => !knownIdsRef.current.has(q.id));
      const pendingIncreased =
        prevPendingRef.current !== null && nextPending > prevPendingRef.current;

      if (newItems.length > 0 && newItems.some((q) => !q.gestionado)) {
        const ids = newItems.filter((q) => !q.gestionado).map((q) => q.id);
        setHasNewAlert(true);
        setNewInquiryIds((prev) => new Set([...prev, ...ids]));
        setSelectedIdState(ids[0] ?? null);
        toast({
          title: "Nuevo mensaje de contacto",
          description: `${newItems[0]?.nombre ?? "Alguien"} ha escrito desde la landing.`,
        });
      } else if (pendingIncreased) {
        setHasNewAlert(true);
        toast({
          title: "Nuevo mensaje de contacto",
          description: "Hay un mensaje pendiente en el panel lateral.",
        });
      }
    } else {
      initializedRef.current = true;
      const firstPending = next.find((q) => !q.gestionado);
      setSelectedIdState(firstPending?.id ?? next[0]?.id ?? null);
    }

    knownIdsRef.current = new Set(next.map((q) => q.id));
    prevPendingRef.current = nextPending;
    setInquiries(next);

    if (selectedIdRef.current && !next.some((q) => q.id === selectedIdRef.current)) {
      setSelectedIdState(next.find((q) => !q.gestionado)?.id ?? next[0]?.id ?? null);
    }

    return true;
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const value = useMemo(
    () => ({
      inquiries,
      pendingCount,
      selectedId,
      setSelectedId,
      refresh,
      patchInquiry,
      hasNewAlert,
      clearNewAlert,
      dismissBellAlert,
      newInquiryIds,
    }),
    [inquiries, pendingCount, selectedId, setSelectedId, refresh, patchInquiry, hasNewAlert, clearNewAlert, dismissBellAlert, newInquiryIds],
  );

  return (
    <AdminInquiriesContext.Provider value={value}>{children}</AdminInquiriesContext.Provider>
  );
}

export function useAdminInquiries() {
  const ctx = useContext(AdminInquiriesContext);
  if (!ctx) {
    throw new Error("useAdminInquiries must be used within AdminInquiriesProvider");
  }
  return ctx;
}
