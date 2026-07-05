import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/dashboard/kanban-board";

export default async function CrmPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: equipo } = await supabase
    .from("equipo")
    .select("empresa_id")
    .eq("usuario_id", user.id)
    .single();

  if (!equipo) return <p>No tienes empresa asignada.</p>;

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM</h1>
        <p className="text-muted-foreground">Arrastra los leads entre columnas para actualizar su estado</p>
      </div>
      <KanbanBoard empresaId={equipo.empresa_id} />
    </div>
  );
}
