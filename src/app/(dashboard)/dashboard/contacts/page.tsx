import { ContactsPanel } from "@/components/dashboard/contacts-panel";
import { fetchLeadsForEmpresa } from "@/lib/dashboard/leads-data";
import { requireDashboardContext } from "@/lib/dashboard/session";

export default async function ContactsPage() {
  const context = await requireDashboardContext();
  const leads = await fetchLeadsForEmpresa(context.empresaId);

  return <ContactsPanel leads={leads} plan={context.plan} />;
}
