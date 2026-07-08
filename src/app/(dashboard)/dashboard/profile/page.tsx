import { ProfilePanel } from "@/components/dashboard/profile-panel";
import { getProfileData } from "@/lib/dashboard/profile-data";
import { getSiteUrl } from "@/lib/config/site";

export default async function ProfilePage() {
  const profile = await getProfileData();
  if (!profile) {
    return <p className="text-muted-foreground">No se encontró tu perfil.</p>;
  }

  return (
    <ProfilePanel
      key={`${profile.empresa.id}-${profile.empresa.nombre_empresa}`}
      profile={profile}
      appUrl={getSiteUrl()}
    />
  );
}
