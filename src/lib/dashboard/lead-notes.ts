import type { Lead } from "@/types/database";

export function leadHasNotas(lead: Pick<Lead, "notas">): boolean {
  return Boolean(lead.notas?.trim());
}
