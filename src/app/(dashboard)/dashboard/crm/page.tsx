import { KanbanBoard } from "@/components/dashboard/kanban-board";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireDashboardContext } from "@/lib/dashboard/session";

export default async function CrmPage() {
  const { empresaId } = await requireDashboardContext();

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="CRM"
        description="Arrastra los leads entre columnas para actualizar su estado"
      />
      <KanbanBoard empresaId={empresaId} />
    </div>
  );
}
