import { AuthCard } from "@/components/auth-card";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { getDictionary } from "@/lib/i18n";
import { requireOnboardingRole } from "@/services/auth-service";

export default async function BrandOnboardingPage() {
  await requireOnboardingRole("BRAND");
  const dictionary = getDictionary();
  return <AuthCard title={dictionary.onboarding.brandTitle} description={dictionary.onboarding.brandDescription}><OnboardingForm mode="brand" dictionary={dictionary} /></AuthCard>;
}
