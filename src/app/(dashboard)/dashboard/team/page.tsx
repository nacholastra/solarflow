import { TeamPanel } from "@/components/dashboard/team-panel";
import { getTeamData } from "@/lib/dashboard/team-data";
import { requireDashboardContext } from "@/lib/dashboard/session";
import { getSiteUrl } from "@/lib/config/site";

export default async function TeamPage() {
  const context = await requireDashboardContext();
  const teamData = await getTeamData(context.empresaId);

  return (
    <TeamPanel
      initialData={teamData}
      appUrl={getSiteUrl()}
      rol={context.rol}
      plan={context.plan}
    />
  );
}
