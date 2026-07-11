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
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  refresh: () => Promise<void>;
  hasNewAlert: boolean;
  clearNewAlert: () => void;
};

const AdminInquiriesContext = createContext<AdminInquiriesContextValue | null>(null);

const POLL_MS = 45_000;

export function AdminInquiriesProvider({ children }: { children: React.ReactNode }) {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const prevPendingRef = useRef<number | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const selectedIdRef = useRef<string | null>(null);
  selectedIdRef.current = selectedId;

  const pendingCount = useMemo(
    () => inquiries.filter((q) => !q.gestionado).length,
    [inquiries],
  );

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/contact-inquiries");
    const json = (await res.json()) as { inquiries?: ContactInquiry[]; error?: string };
    if (!res.ok) return;

    const next = json.inquiries ?? [];
    const nextPending = next.filter((q) => !q.gestionado).length;

    if (initializedRef.current) {
      const newIds = next.filter((q) => !knownIdsRef.current.has(q.id));
      const pendingIncreased =
        prevPendingRef.current !== null && nextPending > prevPendingRef.current;

      if (newIds.length > 0 && newIds.some((q) => !q.gestionado)) {
        setHasNewAlert(true);
        toast({
          title: "Nueva consulta de contacto",
          description: `${newIds[0]?.nombre ?? "Alguien"} ha enviado un mensaje desde la landing.`,
        });
      } else if (pendingIncreased) {
        setHasNewAlert(true);
        toast({
          title: "Nueva consulta de contacto",
          description: "Hay mensajes pendientes por revisar.",
        });
      }
    } else {
      initializedRef.current = true;
    }

    knownIdsRef.current = new Set(next.map((q) => q.id));
    prevPendingRef.current = nextPending;
    setInquiries(next);

    if (selectedIdRef.current && !next.some((q) => q.id === selectedIdRef.current)) {
      setSelectedId(next.find((q) => !q.gestionado)?.id ?? next[0]?.id ?? null);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
    setHasNewAlert(false);
    if (!selectedId) {
      const firstPending = inquiries.find((q) => !q.gestionado);
      setSelectedId(firstPending?.id ?? inquiries[0]?.id ?? null);
    }
  }, [inquiries, selectedId]);

  const value = useMemo(
    () => ({
      inquiries,
      pendingCount,
      sidebarOpen,
      openSidebar,
      closeSidebar: () => setSidebarOpen(false),
      toggleSidebar: () => {
        setSidebarOpen((open) => {
          if (!open) {
            setHasNewAlert(false);
            if (!selectedId) {
              const firstPending = inquiries.find((q) => !q.gestionado);
              setSelectedId(firstPending?.id ?? inquiries[0]?.id ?? null);
            }
          }
          return !open;
        });
      },
      selectedId,
      setSelectedId,
      refresh,
      hasNewAlert,
      clearNewAlert: () => setHasNewAlert(false),
    }),
    [inquiries, pendingCount, sidebarOpen, openSidebar, selectedId, refresh, hasNewAlert],
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
