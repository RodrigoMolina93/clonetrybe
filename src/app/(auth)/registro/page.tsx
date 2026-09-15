import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/features/auth/auth-form";
import { getDictionary } from "@/lib/i18n";

export default function RegisterPage() {
  const dictionary = getDictionary();
  return <AuthCard title={dictionary.auth.registerTitle} description={dictionary.auth.registerDescription}><AuthForm mode="register" dictionary={dictionary} /></AuthCard>;
}
