import { PageHeader } from "@/components/page-header";
import { OrganizationSettingsForm, ProfileSettingsForm } from "@/features/settings/settings-forms";
import { getDictionary } from "@/lib/i18n";
import { requireViewer } from "@/services/auth-service";

export default async function SettingsPage() {
  const viewer = await requireViewer();
  const dictionary = getDictionary();
  return (
    <div>
      <PageHeader eyebrow={dictionary.settings.eyebrow} title={dictionary.settings.title} description={dictionary.settings.description} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSettingsForm firstName={viewer.firstName} lastName={viewer.lastName} dictionary={dictionary} />
        <OrganizationSettingsForm organization={{ id: viewer.organization.id, name: viewer.organization.name, role: viewer.organization.role }} dictionary={dictionary} />
      </div>
    </div>
  );
}
