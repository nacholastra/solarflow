import { BRAND } from "@/lib/config/brand";

/** Datos legales del titular. Vacío hasta configurar NEXT_PUBLIC_LEGAL_* en Vercel. */
export const LEGAL = {
  companyName: BRAND.name,
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME?.trim() || BRAND.name,
  cif: process.env.NEXT_PUBLIC_LEGAL_CIF?.trim() || "Pendiente de asignación",
  address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() || "Pendiente de completar",
  email: BRAND.supportEmail,
  lastUpdated: "2026",
} as const;
