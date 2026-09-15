import { AuthCard } from "@/components/auth-card";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { getDictionary } from "@/lib/i18n";
import { requireOnboardingRole } from "@/services/auth-service";

export default async function CreatorOnboardingPage() {
  await requireOnboardingRole("CREATOR");
  const dictionary = getDictionary();
  return <AuthCard title={dictionary.onboarding.creatorTitle} description={dictionary.onboarding.creatorDescription}><OnboardingForm mode="creator" dictionary={dictionary} /></AuthCard>;
}
