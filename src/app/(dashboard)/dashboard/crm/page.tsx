import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireDashboardContext } from "@/lib/dashboard/session";
import { fetchLeadsForEmpresa } from "@/lib/dashboard/leads-data";

export default async function CrmPage() {
  const { empresaId } = await requireDashboardContext();
  const leads = await fetchLeadsForEmpresa(empresaId);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="CRM"
        description="Arrastra los leads entre columnas para actualizar su estado"
      />
      <KanbanBoard empresaId={empresaId} initialLeads={leads} />
    </div>
  );
}
