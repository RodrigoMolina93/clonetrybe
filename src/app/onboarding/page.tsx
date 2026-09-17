import { AuthCard } from "@/components/auth-card";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";
import { getDictionary } from "@/lib/i18n";
import { requireOnboarding } from "@/services/auth-service";

export default async function OnboardingPage() {
  await requireOnboarding();
  const dictionary = getDictionary();
  return <AuthCard title={dictionary.onboarding.title} description={dictionary.onboarding.description}><OnboardingForm dictionary={dictionary} /></AuthCard>;
}
